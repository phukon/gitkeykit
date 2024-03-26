import { execSync } from "child_process";
import confirm from "@inquirer/confirm";
import { configureGPG } from "./configureGPG";
import { setGitConfig } from "./setGitConfig";
import { generateGpgKeys } from "./generate";
import createLogger from "../logger";
import os from "os";

const platform: NodeJS.Platform = os.platform();
const logger = createLogger("commands: start");

export async function checkSecretKeys(gpgAgentAddress: string[]) {
  try {
    // Check for secret keys
    const secretKeys = execSync("gpg --list-secret-keys").toString();
    if (secretKeys.includes("sec")) {
      logger.blue("Secret keys are present on your system.");
      await setGitConfig(gpgAgentAddress);
      if (platform === "linux") {
        await configureGPG();
        logger.green("Setup finished! Happy coding!");
        process.exit(1);
      }
      logger.green("Setup finished! Happy coding!");
    } else {
      logger.warning("No secret keys found on your system.");
      const ok = await confirm({ message: "Do you want to generate GPG keys now?" });
      if (ok) {
        await generateGpgKeys();
        await setGitConfig(gpgAgentAddress);
        logger.highlight("Before config");
        if (platform === "linux") {
          await configureGPG();
          logger.green("Setup finished! Happy coding!");
          process.exit(1);
        }
        logger.green("Setup finished! Happy coding!");
        process.exit(1);
      } else {
        process.exit(1);
      }
    }
  } catch (error: any) {
    logger.error("Error:", (error as Error).message);
  }
}
