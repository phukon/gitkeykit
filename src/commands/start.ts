import { checkRequiredDependencies } from '../utils/checkDependencies';
import { checkSecretKeys } from '../utils/checkSecretKeys';
import { createPgpKey } from '../utils/createKey';
import { setGitConfig } from '../utils/setGitConfig'
import { addExtraConfig } from '../utils/linuxConfig';
import { platform } from 'os';
// import chalk from 'chalk';
import { GitKeyKitCodes } from '../gitkeykitCodes';
import createLogger from '../utils/logger';

const logger = createLogger('commands:start');

export async function start(): Promise<GitKeyKitCodes> {
  try {
    // Check dependencies
    const { code, gpgPath } = await checkRequiredDependencies();
    if (code !== GitKeyKitCodes.SUCCESS) {
      return code;
    }

    if (!gpgPath) {
      logger.error('GPG path not found');
      return GitKeyKitCodes.ERR_GPG_NOT_FOUND;
    }

    // Check for existing GPG keys
    const secretKeyResult = await checkSecretKeys();
    if (secretKeyResult !== GitKeyKitCodes.SUCCESS) {
      // Create new key if none exists
      const keyResult = await createPgpKey();
      if (keyResult !== GitKeyKitCodes.SUCCESS) {
        return keyResult;
      }
    }

    // Configure git
    const gitConfigResult = await setGitConfig(gpgPath);
    if (gitConfigResult !== GitKeyKitCodes.SUCCESS) {
      return gitConfigResult;
    }

    // Add extra configuration for non-Windows platforms
    if (platform() !== 'win32') {
      const configResult = await addExtraConfig();
      if (configResult !== GitKeyKitCodes.SUCCESS) {
        return configResult;
      }
    }

    logger.green('Setup complete. Happy coding! 🎉');
    return GitKeyKitCodes.SUCCESS;

  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Unexpected error: ${error.message}`);
    }
    return GitKeyKitCodes.ERR_INVALID_INPUT;
  }
}