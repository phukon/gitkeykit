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

    await checkSecretKeys();
    
    await createPgpKey();

    await setGitConfig(gpgPath);

    if (platform() !== 'win32') {
      await addExtraConfig();
    }

    logger.green('Setup complete. Happy coding! 🎉');
  } catch (error) {
    if (error instanceof GitKeyKitError) {
      logger.error(`Setup failed: ${error.message}`);
      logger.debug('Error details:', error.details);
      throw error; // Re-throwing... to be handled by the CLI
    }

    throw new GitKeyKitError(
      'Unexpected error during setup',
      GitKeyKitCodes.INVALID_INPUT,
      error
    );
  }
}