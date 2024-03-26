import { execSync } from "child_process";
import { existsSync } from "fs";
import createLogger from "../logger";
import os from "os";
import path from "path";

const platform: NodeJS.Platform = os.platform();
const logger = createLogger("commands: start");

function clearGPGConf() {
  const gpgConfPath = path.join(os.homedir(), ".gnupg", "gpg.conf");

  // Clear gpg.conf if it exists
  if (existsSync(gpgConfPath)) {
    execSync(`echo -n > ${gpgConfPath}`);
  }
}

export async function reset(): Promise<void> {
  try {
    if (platform === "win32") {
      execSync(`git config --global --unset user.name`);
      execSync(`git config --global --unset user.email`);
      execSync(`git config --global --unset user.signingkey`);
      execSync(`git config --global --unset commit.gpgsign`);
      execSync(`git config --global --unset tag.gpgsign`);
      execSync(`git config --global --unset gpg.program`);
      logger.log("Git config has been reset!");
    } else if (platform == "linux") {
      await clearGPGConf();
      logger.log("GPG config has been reset!");
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error("Error occurred while resetting configurations:", error);
  }
}
