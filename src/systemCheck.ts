import { exec } from 'child_process';
import { promisify } from 'util';
import { GitKeyKitCodes } from './gitkeykitCodes';
import { platform } from 'os';

const execAsync = promisify(exec);

const COMMANDS = {
  GPG_CHECK: platform() === 'win32' ? 'where gpg' : 'which gpg',
  GIT_CHECK: platform() === 'win32' ? 'where git' : 'which git'
};

/**
 * Checks if GPG is installed and returns its path
 * @returns Promise resolving to GPG path or error code
 */
export async function checkGpgInstallation(): Promise<{ code: GitKeyKitCodes, path?: string }> {
  try {
    const { stdout } = await execAsync(COMMANDS.GPG_CHECK);
    const gpgPath = stdout.trim();
    
    if (gpgPath) {
      return {
        code: GitKeyKitCodes.SUCCESS,
        path: gpgPath
      };
    }
    
    return {
      code: GitKeyKitCodes.ERR_GPG_NOT_FOUND
    };
  } catch (error) {
    return {
      code: GitKeyKitCodes.ERR_GPG_NOT_FOUND
    };
  }
}

/**
 * Checks if Git is installed
 * @returns Promise resolving to success or error code
 */
export async function checkGitInstallation(): Promise<GitKeyKitCodes> {
  try {
    await execAsync(COMMANDS.GIT_CHECK);
    return GitKeyKitCodes.SUCCESS;
  } catch (error) {
    return GitKeyKitCodes.ERR_GIT_NOT_FOUND;
  }
}

/**
 * Checks all required dependencies
 * @returns Promise resolving to GPG path or error code
 */
export async function checkRequiredDependencies(): Promise<{ code: GitKeyKitCodes, gpgPath?: string }> {
  // Check Git first
  const gitCheck = await checkGitInstallation();
  if (gitCheck !== GitKeyKitCodes.SUCCESS) {
    return { code: gitCheck };
  }

  // Then check GPG
  const gpgCheck = await checkGpgInstallation();
  return {
    code: gpgCheck.code,
    gpgPath: gpgCheck.path
  };
}
