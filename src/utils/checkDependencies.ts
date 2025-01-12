import { GitKeyKitCodes } from "../gitkeykitCodes";
import { checkGitInstallation, checkGpgInstallation } from "../systemCheck";

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