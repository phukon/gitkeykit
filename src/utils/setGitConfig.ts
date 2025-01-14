import input from '@inquirer/input';
import { execFile } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { GitKeyKitCodes } from '../gitkeykitCodes';

const execFileAsync = promisify(execFile);

async function getGpgKeyFingerprint(): Promise<string> {
  try {
    /*
    output of `gpg --list-secret-keys --with-colons`
    ┌────────────────────────────────────────────────────────────────────────────┐
    │ sec:u:4096:1:A1B2C3D4E5F6G7H8:1700848217:::u:::scESC:::#:::23::0:          │
    │ fpr:::::::::1234567890ABCDEF1234567890ABCDEF12345678:                      │<-- we want this one
    │ grp:::::::::ABCDEF1234567890ABCDEF1234567890ABCDEF12:                      │
    │ uid:u::::1700850983::0123456789ABCDEF0123456789ABCDEF01234567::Username    │
    │     <email>::::::::::0:                                                    │
    │ ssb:u:4096:1:FEDCBA9876543210:1732404248:1858548248:::::e:::+:::23:        │
    │ fpr:::::::::FEDCBA9876543210FEDCBA9876543210FEDCBA98:                      │
    │ grp:::::::::9876543210FEDCBA9876543210FEDCBA98765432:                      │
    │ ssb:u:4096:1:1A2B3C4D5E6F7G8H:1732404191:1858548191:::::s:::+:::23:        │
    │ fpr:::::::::ABCD1234EFGH5678IJKL9012MNOP3456QRST7890:                      │
    │ grp:::::::::WXYZ7890ABCD1234EFGH5678IJKL9012MNOP3456:                      │
    └────────────────────────────────────────────────────────────────────────────┘
    */
    const { stdout } = await execFileAsync('gpg', ['--list-secret-keys', '--with-colons']);
    
    const lines = stdout.split('\n');
    let isPrimaryKey = false;
    let keyFingerprint = '';
    
    for (const line of lines) {
      const parts = line.split(':');
      // Mark when we find a primary key (sec)
      if (parts[0] === 'sec') {
        isPrimaryKey = true;
        continue;
      }
      // Get the fingerprint only if it's for the primary key
      if (isPrimaryKey && parts[0] === 'fpr') {
        keyFingerprint = parts[9];
        break;
      }
      
      if (parts[0] === 'ssb') {
        isPrimaryKey = false;
      }
    }

    if (!keyFingerprint) {
      throw new Error('No GPG key found');
    }

    console.log(chalk.green(`Found GPG key: ${keyFingerprint}`));
    return keyFingerprint;

  } catch (error) {
    throw new Error('Failed to get GPG key fingerprint');
  }
}

async function setGitConfigValue(key: string, value: string): Promise<void> {
  try {
    await execFileAsync('git', ['config', '--global', key, value]);
  } catch (error) {
    throw new Error(`Error setting git config ${key}`);
  }
}

export async function setGitConfig(gpgPath: string): Promise<GitKeyKitCodes> {
  try {
    const username = await input({
      message: 'Enter your name:',
      validate: (value) => value.length > 0 || 'Name cannot be empty'
    });

    const email = await input({
      message: 'Enter your email:',
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Please enter a valid email';
      }
    });

    console.log(chalk.blue('Setting git config...'));

    const keyFingerprint = await getGpgKeyFingerprint();

    const configs = [
      ['user.name', username],
      ['user.email', email],
      ['user.signingkey', keyFingerprint],
      ['commit.gpgsign', 'true'],
      ['tag.gpgsign', 'true'],
      ['gpg.program', gpgPath]
    ];

    for (const [key, value] of configs) {
      try {
        await setGitConfigValue(key, value);
      } catch (error) {
        console.error(chalk.red(`Error setting ${key}: ${error}`));
        return GitKeyKitCodes.ERR_GIT_CONFIG;
      }
    }

    console.log(chalk.green('Git configurations applied successfully'));
    return GitKeyKitCodes.SUCCESS;

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('No GPG key found')) {
        console.error(chalk.red('No GPG key found'));
        return GitKeyKitCodes.ERR_NO_SECRET_KEYS;
      }
      console.error(chalk.red(`Error: ${error.message}`));
    }
    return GitKeyKitCodes.ERR_INVALID_INPUT;
  }
}