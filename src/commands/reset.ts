import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import createLogger from "../utils/logger";
import os from "os";
import path from "path";
import { GitKeyKitCodes } from "../gitkeykitCodes";

const logger = createLogger("commands: reset");

function restoreGPGConfig(): GitKeyKitCodes {
  const homeDir = os.homedir();
  if (!homeDir) {
    logger.error("Error: Could not get the home directory");
    return GitKeyKitCodes.ERR_HOME_DIRECTORY_NOT_FOUND;
  }

  const gnupgDir = path.join(homeDir, ".gnupg");
  const gpgConfPath = path.join(gnupgDir, "gpg.conf");
  const backupPath = `${gpgConfPath}.backup`;

  if (existsSync(backupPath)) {
    try {
      const backupContent = readFileSync(backupPath, 'utf-8');
      writeFileSync(gpgConfPath, backupContent);
      writeFileSync(backupPath, '');
      logger.log("GPG configuration restored from backup.");
      return GitKeyKitCodes.SUCCESS;
    } catch (error) {
      logger.error("Error: Could not restore GPG configuration from backup");
      return GitKeyKitCodes.ERR_GPG_CONFIG_RESET;
    }
  }

  return clearGPGConfig();
}

function clearGPGConfig(): GitKeyKitCodes {
  const homeDir = os.homedir();
  if (!homeDir) {
    logger.error("Error: Could not get the home directory");
    return GitKeyKitCodes.ERR_HOME_DIRECTORY_NOT_FOUND;
  }

  const gnupgDir = path.join(homeDir, ".gnupg");
  const gpgConfPath = path.join(gnupgDir, "gpg.conf");

  // If .gnupg directory doesn't exist, nothing to clear
  if (!existsSync(gnupgDir)) {
    return GitKeyKitCodes.SUCCESS;
  }

  try {
    // Write empty content to gpg.conf
    writeFileSync(gpgConfPath, "");
    logger.log("GPG configuration cleared.");
    return GitKeyKitCodes.SUCCESS;
  } catch (error) {
    logger.error("Error: Could not open gpg.conf for clearing");
    return GitKeyKitCodes.ERR_GPG_CONFIG_RESET;
  }
}

export function reset(): GitKeyKitCodes {
  try {
    const gitCommands = [
      "git config --global --unset user.name",
      "git config --global --unset user.email",
      "git config --global --unset user.signingkey",
      "git config --global --unset commit.gpgsign",
      "git config --global --unset tag.gpgsign",
      "git config --global --unset gpg.program"
    ];

    for (const cmd of gitCommands) {
      execSync(cmd);
    }

    logger.log("Git configuration reset successfully.");

    if (os.platform() === "linux") {
      return restoreGPGConfig();
    }

    return GitKeyKitCodes.SUCCESS;
  } catch (error) {
    logger.error("Error: Failed to reset git configuration.");
    return GitKeyKitCodes.ERR_GIT_CONFIG_RESET;
  }
}