import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { GitKeyKitCodes, GitKeyKitError } from "../gitkeykitCodes";
import { platform, homedir } from "os";
import { join } from "path";
import createLogger from "../utils/logger";

const logger = createLogger("commands:reset");

async function restoreGpgConfig(): Promise<void> {
  const homeDir = homedir();
  if (!homeDir) {
    throw new GitKeyKitError("Could not get home directory", GitKeyKitCodes.HOME_DIR_NOT_FOUND);
  }

  const gnupgDir = join(homeDir, ".gnupg");
  const gpgConfPath = join(gnupgDir, "gpg.conf");
  const backupPath = `${gpgConfPath}.backup`;

  if (existsSync(backupPath)) {
    try {
      const backupContent = readFileSync(backupPath, "utf-8");
      writeFileSync(gpgConfPath, backupContent);
      writeFileSync(backupPath, "");
      logger.log("GPG configuration restored from backup.");
      return;
    } catch (error) {
      throw new GitKeyKitError("Could not restore GPG configuration from backup", GitKeyKitCodes.GPG_CONFIG_RESET_ERROR, error);
    }
  }

  await clearGpgConfig();
}

async function clearGpgConfig(): Promise<void> {
  const homeDir = homedir();
  if (!homeDir) {
    throw new GitKeyKitError("Could not get home directory", GitKeyKitCodes.HOME_DIR_NOT_FOUND);
  }

  const gnupgDir = join(homeDir, ".gnupg");
  const gpgConfPath = join(gnupgDir, "gpg.conf");

  // If .gnupg directory doesn't exist, nothing to clear
  if (!existsSync(gnupgDir)) {
    return;
  }

  try {
    writeFileSync(gpgConfPath, "");
    logger.log("GPG configuration cleared.");
  } catch (error) {
    throw new GitKeyKitError("Could not open gpg.conf for clearing", GitKeyKitCodes.GPG_CONFIG_RESET_ERROR, error);
  }
}

/**
 * Resets Git and GPG configurations
 * @throws {GitKeyKitError} If reset operation fails
 */
export async function reset(): Promise<void> {
  try {
    const gitCommands = [
      "git config --global --unset user.name",
      "git config --global --unset user.email",
      "git config --global --unset user.signingkey",
      "git config --global --unset commit.gpgsign",
      "git config --global --unset tag.gpgsign",
      "git config --global --unset gpg.program",
    ];

    for (const cmd of gitCommands) {
      try {
        execSync(cmd);
      } catch (error) {
        if (!(error as any)?.message?.includes("key does not exist")) {
          throw error;
        }
      }
    }

    logger.log("Git configuration reset successfully.");

    if (platform() === "linux") {
      await restoreGpgConfig();
    }
  } catch (error) {
    if (error instanceof GitKeyKitError) {
      throw error;
    }
    throw new GitKeyKitError("Failed to reset git configuration", GitKeyKitCodes.GIT_CONFIG_RESET_ERROR, error);
  }
}
