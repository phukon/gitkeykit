import { readFileSync } from "fs";
import { execSync } from "child_process";
import { GitKeyKitCodes, GitKeyKitError } from "../gitkeykitCodes";
import createLogger from "../utils/logger";

const logger = createLogger("commands:import");

/**
 * Imports a GPG key from a file
 * @param keyPath Path to the key file
 * @throws {GitKeyKitError} If key import fails
 */
export async function importKey(keyPath: string): Promise<void> {
  try {
    let keyContent: string;
    try {
      keyContent = readFileSync(keyPath, "utf-8");
    } catch (error) {
      throw new GitKeyKitError(`Failed to read key file: ${keyPath}`, GitKeyKitCodes.KEY_IMPORT_ERROR, error);
    }

    if (!keyContent.includes("-----BEGIN PGP PRIVATE KEY BLOCK-----")) {
      throw new GitKeyKitError("Invalid key file format: Missing PGP private key block", GitKeyKitCodes.KEY_IMPORT_ERROR);
    }

    try {
      execSync("gpg --import", {
        input: keyContent,
        stdio: ["pipe", "inherit", "inherit"],
      });

      logger.green("GPG key imported successfully");
    } catch (error) {
      throw new GitKeyKitError("Failed to import GPG key", GitKeyKitCodes.KEY_IMPORT_ERROR, error);
    }
  } catch (error) {
    if (error instanceof GitKeyKitError) {
      throw error;
    }
    throw new GitKeyKitError("Unexpected error during key import", GitKeyKitCodes.KEY_IMPORT_ERROR, error);
  }
}
