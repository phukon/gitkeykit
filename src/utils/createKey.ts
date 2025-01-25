import { spawn } from "child_process";
import confirm from "@inquirer/confirm";
import { GitKeyKitCodes, GitKeyKitError } from "../gitkeykitCodes";
import createLogger from "./logger";

const logger = createLogger("utils:createKey");

/**
 * Creates a new PGP key
 * @throws {GitKeyKitError} If key creation fails or is aborted
 */
export async function createPgpKey(force: boolean = false): Promise<void> {
  try {
    const shouldCreate = force || await confirm({
      message: "Do you want to create a new PGP key?",
      default: false,
    });

    if (!shouldCreate) {
      logger.highlight("User aborted key creation");
      return;
    }

    logger.blue("Creating new PGP key...");

    await new Promise<void>((resolve, reject) => {
      const gpg = spawn("gpg", ["--full-generate-key"], {
        stdio: "inherit",
      });

      gpg.on("error", (error) => {
        reject(new GitKeyKitError("Failed to start GPG process", GitKeyKitCodes.KEY_GENERATION_ERROR, error));
      });

      gpg.on("close", (code) => {
        if (code === 0) {
          logger.green("GPG key has been generated successfully.");
          resolve();
        } else {
          reject(new GitKeyKitError("Failed to generate GPG key", GitKeyKitCodes.KEY_GENERATION_ERROR, { exitCode: code }));
        }
      });
    });
  } catch (error) {
    if (error instanceof GitKeyKitError) {
      throw error;
    }

    throw new GitKeyKitError("Unexpected error during key creation", GitKeyKitCodes.KEY_GENERATION_ERROR, error);
  }
}
