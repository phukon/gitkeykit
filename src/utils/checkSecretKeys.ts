import { spawn } from "child_process";
import { GitKeyKitCodes, GitKeyKitError } from "../gitkeykitCodes";

import createLogger from "./logger";

const logger = createLogger("utils:checkSecretKeys");

/**
 * Checks if GPG secret keys exist on the system
 * @throws {GitKeyKitError} If no secret keys found or check fails
 */
export async function checkSecretKeys(): Promise<void> {
  return new Promise((resolve, reject) => {
    const gpgProcess = spawn("gpg", ["--list-secret-keys"]);
    let output: string = "";

    gpgProcess.stdout.on("data", (data: Buffer) => {
      output += data.toString();
    });

    gpgProcess.on("error", (error) => {
      reject(new GitKeyKitError("Failed to check GPG secret keys", GitKeyKitCodes.NO_SECRET_KEYS, error));
    });

    gpgProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new GitKeyKitError("GPG process exited with non-zero code", GitKeyKitCodes.NO_SECRET_KEYS, { exitCode: code }));
        return;
      }

      if (!output.includes("sec")) {
        reject(new GitKeyKitError("No GPG secret keys found", GitKeyKitCodes.NO_SECRET_KEYS));
        return;
      }

      logger.debug("Found existing GPG secret keys");
      resolve();
    });
  });
}
