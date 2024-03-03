import { execSync } from "child_process";
import confirm from "@inquirer/confirm";
import { setGitConfig } from "../utils/setGitConfig.js";
import { generateGpgKeys } from "./generate.js";

import createLogger from "../logger.js";
const logger = createLogger("commands: checkSecretKeys");

export async function checkSecretKeys(gpgAgentAddress) {
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