import { mkdir, appendFile, writeFile, readFile, access } from "fs/promises";
import { exec } from "child_process";
import { join } from "path";
import { promisify } from "util";
import { homedir } from "os";
import chalk from "chalk";
import boxen from "boxen";
import { GitKeyKitCodes, GitKeyKitError } from "../gitkeykitCodes";
import createLogger from "./logger";

const logger = createLogger("utils:linuxConfig");
const execAsync = promisify(exec);

async function backupGpgConfig(gpgConfPath: string): Promise<void> {
  try {
    await access(gpgConfPath);
    const existingConfig = await readFile(gpgConfPath, "utf-8");
    const backupPath = `${gpgConfPath}.backup`;
    await writeFile(backupPath, existingConfig);
    logger.debug(`Backed up GPG config to ${backupPath}`);
  } catch (error) {
    // File doesn't exist, no backup needed
    if ((error as { code?: string }).code === "ENOENT") {
      logger.debug("No existing GPG config to backup");
      return;
    }
    throw new GitKeyKitError("Failed to backup GPG config", GitKeyKitCodes.GPG_CONFIG_RESET_ERROR, error);
  }
}

async function createDirectory(path: string): Promise<void> {
  try {
    await mkdir(path, { mode: 0o700, recursive: true });
    logger.debug(`Created directory: ${path}`);
  } catch (error) {
    if ((error as { code?: string }).code !== "EEXIST") {
      throw new GitKeyKitError(`Failed to create directory: ${path}`, GitKeyKitCodes.HOME_DIR_NOT_FOUND, error);
    }
  }
}

async function appendToFile(filepath: string, content: string): Promise<void> {
  try {
    await appendFile(filepath, content + "\n");
    logger.debug(`Appended to file ${filepath}: ${content}`);
  } catch (error) {
    throw new GitKeyKitError(`Failed to write to file: ${filepath}`, GitKeyKitCodes.GPG_CONFIG_RESET_ERROR, error);
  }
}

export async function addExtraConfig(): Promise<void> {
  try {
    const homeDir = homedir();
    if (!homeDir) {
      throw new GitKeyKitError("Could not get home directory", GitKeyKitCodes.HOME_DIR_NOT_FOUND);
    }

    const gnupgDir = join(homeDir, ".gnupg");
    const gpgConfPath = join(gnupgDir, "gpg.conf");

    await backupGpgConfig(gpgConfPath);
    await createDirectory(gnupgDir);

    try {
      await writeFile(gpgConfPath, "", { flag: "a" });
    } catch (error) {
      throw new GitKeyKitError("Could not open gpg.conf", GitKeyKitCodes.GPG_CONFIG_RESET_ERROR, error);
    }

    await appendToFile(gpgConfPath, "use-agent");
    await appendToFile(gpgConfPath, "pinentry-mode loopback");

    // kill and restart gpg-agent
    try {
      await execAsync("gpgconf --kill gpg-agent");
      logger.green("gpg-agent killed.");
    } catch (error) {
      logger.warning("Warning: Could not kill gpg-agent");
      logger.debug("Kill gpg-agent error:", error);
    }

    try {
      await execAsync("gpg-agent --daemon");
      logger.green("gpg-agent restarted.");
    } catch (error) {
      logger.warning("Warning: Could not start gpg-agent");
      logger.debug("Start gpg-agent error:", error);
    }

    console.log(
      boxen(chalk.white(["Changes written to GPG config.", "(~/.gnupg/gpg.conf)", "", "> use-agent", "> pinentry-mode loopback"].join("\n")), {
        padding: 1,
        margin: 1,
        borderStyle: "round",
      })
    );
  } catch (error) {
    if (error instanceof GitKeyKitError) {
      throw error;
    }
    throw new GitKeyKitError("Failed to configure GPG", GitKeyKitCodes.GPG_CONFIG_RESET_ERROR, error);
  }
}
