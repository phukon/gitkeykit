import os from "os";
import createLogger from "../logger";
import { execSync } from "child_process";
import { checkSecretKeys } from "../utils/checkSecretKeys";

const platform: NodeJS.Platform = os.platform();
const logger = createLogger("commands: start");
let gpgAgentAddress: string[];

export async function start(): Promise<void> {
  logger.highlight("Operating System:", platform);

  try {
    // Check GPG version
    const gpgVersion = execSync("gpg --version").toString();
    if (gpgVersion.includes("gpg (GnuPG)")) {
      logger.blue("GPG is installed on your system.");
    } else {
      logger.warning("GPG is not installed on your system.");
    }

    if (platform === "win32") {
      // Check for GPG program on Windows
      const gpgPath = execSync("cmd /c where gpg").toString().trim().split("\r\n");
      if (gpgPath.length > 0) {
        gpgAgentAddress = gpgPath;
        logger.log("GPG program is located at:");
        gpgPath.forEach((path) => logger.log(path));
        await checkSecretKeys(gpgAgentAddress);
      } else {
        logger.error("GPG program is not found on your system.");
      }
    } else if (platform === "linux") {
      // Check for GPG program on Linux
      const gpgPath = execSync("which gpg").toString().trim().split("\n");
      if (gpgPath.length > 0) {
        gpgAgentAddress = gpgPath;
        logger.log("GPG program is located at:", gpgPath);
        await checkSecretKeys(gpgAgentAddress);
      } else {
        logger.error("GPG program is not found on your system.");
      }
    } else {
      process.exit(1);
    }
  } catch (error: any) {
    logger.error("Error:", (error as Error).message);
  }
}
