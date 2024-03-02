import os from "node:os";
import createLogger from "../logger.js";
import { execSync } from "child_process";
import confirm from "@inquirer/confirm";
import { configureGPG } from "../utils/configureGPG.js";
import { setGitConfig } from "../utils/setGitConfig.js";
import { generateGpgKeys } from "./generate.js";
const platform = os.platform();
const logger = createLogger("commands: start");

let gpgAgentAddress;

async function checkSecretKeys() {
  try {
    // Check for secret keys
    const secretKeys = execSync("gpg --list-secret-keys").toString();
    if (secretKeys.includes("sec")) {
      logger.blue("Secret keys are present on your system.");
      await setGitConfig(gpgAgentAddress);
    } else {
      logger.warning("No secret keys found on your system.");
      const ok = await confirm({ message: "Do you want to generate GPG keys now?" });
      if (ok) {
        await generateGpgKeys();
        await setGitConfig(gpgAgentAddress);
      } else {
        process.exit(1);
      }
    }
  } catch (error) {
    logger.error("Error:", error.message);
  }
}

export async function check() {
  logger.highlight("Operating System:", platform);

  try {
    // Check GPG version
    const gpgVersion = execSync("gpg --version").toString();
    if (gpgVersion.includes("gpg (GnuPG)")) {
      logger.blue("GPG is installed on your system.");
    } else {
      logger.warning("GPG is not installed on your system.");
    }

    if (platform == "win32" || platform == "win64") {
      // Check for GPG program on Windows
      const gpgPath = execSync("cmd /c where gpg").toString().trim().split("\r\n");
      if (gpgPath.length > 0) {
        gpgAgentAddress = gpgPath;
        logger.log("GPG program is located at:");
        gpgPath.forEach((path) => logger.log(path));
        await checkSecretKeys();
        configureGPG()
      } else {
        logger.error("GPG program is not found on your system.");
      }
    } else if (platform == "linux") {
      // Check for GPG program on Linux
      const gpgPath = execSync("which gpg").toString().trim().split("\r\n");
      if (gpgPath.length > 0) {
        gpgAgentAddress = gpgPath;
        logger.log("GPG program is located at:", gpgPath);
        await checkSecretKeys();
        configureGPG()

      } else {
        logger.error("GPG program is not found on your system.");
      }
    } else {
      process.exit(1);
    }
  } catch (error) {
    logger.error("Error:", error.message);
  }
}

check();
