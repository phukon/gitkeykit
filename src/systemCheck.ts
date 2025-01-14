import { exec } from "child_process";
import { promisify } from "util";
import { GitKeyKitCodes, GitKeyKitError } from "./gitkeykitCodes";
import { platform } from "os";

const execAsync = promisify(exec);

const COMMANDS = {
  GPG_CHECK: platform() === "win32" ? "where gpg" : "which gpg",
  GIT_CHECK: platform() === "win32" ? "where git" : "which git",
};

/**
 * Checks if GPG is installed and returns its path
 * @throws {GitKeyKitError} If GPG is not found or check fails
 */
export async function checkGpgInstallation(): Promise<string> {
  try {
    const { stdout } = await execAsync(COMMANDS.GPG_CHECK);
    const gpgPath = stdout.trim();

    if (!gpgPath) {
      throw new GitKeyKitError("GPG installation not found", GitKeyKitCodes.GPG_NOT_FOUND);
    }

    return gpgPath;
  } catch (error) {
    throw new GitKeyKitError("Failed to check GPG installation", GitKeyKitCodes.GPG_NOT_FOUND, error);
  }
}

/**
 * Checks if Git is installed
 * @throws {GitKeyKitError} If Git is not found or check fails
 */
export async function checkGitInstallation(): Promise<void> {
  try {
    await execAsync(COMMANDS.GIT_CHECK);
  } catch (error) {
    throw new GitKeyKitError("Git installation not found", GitKeyKitCodes.GIT_NOT_FOUND, error);
  }
}

/**
 * Checks all required dependencies
 * @returns Promise resolving to GPG path
 * @throws {GitKeyKitError} If any dependency check fails
 */
export async function checkRequiredDependencies(): Promise<string> {
  try {

    await checkGitInstallation();
    const gpgPath = await checkGpgInstallation();
    return gpgPath;

  } catch (error) {
    if (error instanceof GitKeyKitError) {
      throw error;
    }

    throw new GitKeyKitError("Failed to check dependencies", GitKeyKitCodes.INVALID_INPUT, error);
  }
}
