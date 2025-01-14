import { spawn } from "child_process";
import confirm from "@inquirer/confirm";
import chalk from "chalk";
import { GitKeyKitCodes } from "../gitkeykitCodes";

export async function createPgpKey(): Promise<GitKeyKitCodes> {
  try {
    const shouldCreate = await confirm({
      message: "Do you want to create a new PGP key?",
      default: false,
    });

    if (!shouldCreate) {
      console.log(chalk.yellow("Aborting key creation."));
      return GitKeyKitCodes.SUCCESS;
    }

    console.log(chalk.blue("Creating new PGP key..."));

    return new Promise((resolve) => {
      const gpg = spawn("gpg", ["--full-generate-key"], {
        stdio: "inherit",
      });

      gpg.on("error", (error) => {
        console.error(chalk.red(`Failed to start GPG process: ${error.message}`));
        resolve(GitKeyKitCodes.ERR_KEY_GENERATION);
      });

      gpg.on("close", (code) => {
        if (code === 0) {
          console.log(chalk.green("GPG key has been generated successfully."));
          resolve(GitKeyKitCodes.SUCCESS);
        } else {
          console.error(chalk.red("Error: Failed to generate GPG key."));
          resolve(GitKeyKitCodes.ERR_KEY_GENERATION);
        }
      });
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    return GitKeyKitCodes.ERR_KEY_GENERATION;
  }
}
