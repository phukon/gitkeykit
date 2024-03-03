import { execSync } from "child_process";
import createLogger from "../logger.js";

const logger = createLogger("commands: start");

function clearGPGConf() {
  const gpgConfPath = path.join(os.homedir(), ".gnupg", "gpg.conf");

  // Clear gpg.conf if it exists
  if (existsSync(gpgConfPath)) {
    execSync(`echo -n > ${gpgConfPath}`);
  }
}

export async function reset() {
  try {
    execSync(`git config --global --unset user.name`);
    execSync(`git config --global --unset user.email"`);
    execSync(`git config --global --unset user.signingkey`);
    execSync("git config --global --unset commit.gpgsign");
    execSync("git config --global --unset tag.gpgsign");
    execSync(`git config --global --unset gpg.program`);
    await clearGPGConf()
    logger.log("Git and GPG configurations have been reset!");
  } catch (error) {
    console.error("Error occurred while setting Git configurations:", error);
  }
}
