import { mkdir, appendFile, writeFile } from "fs/promises";
import { exec } from "child_process";
import { join } from "path";
import { promisify } from "util";
import { homedir } from "os";
import chalk from "chalk";
import boxen from "boxen";
import { GitKeyKitCodes } from "../gitkeykitCodes";

const execAsync = promisify(exec);

async function createDirectory(path: string): Promise<void> {
  try {
    await mkdir(path, { mode: 0o700, recursive: true });
  } catch (error) {
    if ((error as { code?: string }).code !== "EEXIST") {
      throw error;
    }
  }
}

async function appendToFile(filepath: string, content: string): Promise<void> {
  await appendFile(filepath, content + "\n");
}

export async function addExtraConfig(): Promise<GitKeyKitCodes> {
  try {
    const homeDir = homedir();
    if (!homeDir) {
      console.error(chalk.red("Error: Could not get home directory"));
      return GitKeyKitCodes.ERR_INVALID_INPUT;
    }

    const gnupgDir = join(homeDir, ".gnupg");
    const gpgConfPath = join(gnupgDir, "gpg.conf");

    try {
      await createDirectory(gnupgDir);
    } catch (error) {
      console.error(chalk.red("Error: Could not create .gnupg directory"));
      return GitKeyKitCodes.ERR_INVALID_INPUT;
    }

    try {
      await writeFile(gpgConfPath, "");
    } catch (error) {
      console.error(chalk.red("Error: Could not open gpg.conf"));
      return GitKeyKitCodes.ERR_INVALID_INPUT;
    }

    try {
      await appendToFile(gpgConfPath, "use-agent");
      await appendToFile(gpgConfPath, "pinentry-mode loopback");
    } catch (error) {
      console.error(chalk.red("Error: Could not write to gpg.conf"));
      return GitKeyKitCodes.ERR_INVALID_INPUT;
    }

    // kill and restart gpg-agent
    try {
      await execAsync("gpgconf --kill gpg-agent");
      console.log(chalk.green("gpg-agent killed."));
    } catch (error) {
      console.warn(chalk.yellow("Warning: Could not kill gpg-agent"));
    }

    try {
      await execAsync("gpg-agent --daemon");
      console.log(chalk.green("gpg-agent restarted."));
    } catch (error) {
      console.warn(chalk.yellow("Warning: Could not start gpg-agent"));
    }

    console.log(
      boxen(chalk.white(["Changes written to GPG config.", "(~/.gnupg/gpg.conf)", "", "> use-agent", "> pinentry-mode loopback"].join("\n")), {
        padding: 1,
        margin: 1,
        borderStyle: "round",
      })
    );

    return GitKeyKitCodes.SUCCESS;
  } catch (error) {
    console.error(chalk.red(`Unexpected error: ${error}`));
    return GitKeyKitCodes.ERR_INVALID_INPUT;
  }
}
