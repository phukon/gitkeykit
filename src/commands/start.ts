import { checkRequiredDependencies } from '../systemCheck';
import { checkSecretKeys } from '../utils/checkSecretKeys';
import { createPgpKey } from '../utils/createKey';
import { setGitConfig } from '../utils/setGitConfig'
import { addExtraConfig } from '../utils/linuxConfig';
import { platform } from 'os';
import { GitKeyKitError, GitKeyKitCodes } from '../gitkeykitCodes';
import createLogger from '../utils/logger';

const logger = createLogger('commands:start');

export async function start(): Promise<void> {
  try {
    const gpgPath = await checkRequiredDependencies();

    // Try to check for secret keys
    try {
      await checkSecretKeys();
      // If keys exist, ask if user wants to create additional ones
      await createPgpKey();
    } catch (error) {
      if (error instanceof GitKeyKitError && error.code === GitKeyKitCodes.NO_SECRET_KEYS) {
        logger.warning('No GPG secret keys found in the system.');
        logger.blue('Starting key creation process...');
        // Force key creation since no keys exist
        await createPgpKey(true);
      } else {
        throw error;
      }
    }

    await setGitConfig(gpgPath);

    if (platform() !== 'win32') {
      await addExtraConfig();
    }

    logger.green('Setup complete. Happy coding! 🎉');
  } catch (error) {
    if (error instanceof GitKeyKitError) {
      logger.error(`Setup failed: ${error.message}`);
      logger.debug('Error details:', error.details);
      throw error;
    }

    throw new GitKeyKitError(
      'Unexpected error during setup',
      GitKeyKitCodes.INVALID_INPUT,
      error
    );
  }
}