import input from '@inquirer/input';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { GitKeyKitCodes } from '../gitkeykitCodes';

const execAsync = promisify(exec);

async function getGpgKeyFingerprint(): Promise<string> {
  try {
    const { stdout } = await execAsync('gpg --list-secret-keys');
    
    // Find the longest string that could be a fingerprint
    const lines = stdout.split('\n');
    let maxLength = 0;
    let keyFingerprint = '';

    for (const line of lines) {
      const tokens = line.trim().split(/\s+/);
      for (const token of tokens) {
        if (token.length > maxLength) {
          keyFingerprint = token;
          maxLength = token.length;
        }
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
    await execAsync(`git config --global ${key} "${value}"`);
  } catch (error) {
    throw new Error(`Error setting git config ${key}`);
  }
}

export async function setGitConfig(gpgPath: string): Promise<GitKeyKitCodes> {
  try {
    // Get user input
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

    // Get GPG key fingerprint
    const keyFingerprint = await getGpgKeyFingerprint();

    // Configure git settings
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