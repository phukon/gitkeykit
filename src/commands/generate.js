import { execSync } from "child_process";
import createLogger from "../logger.js";
const logger = createLogger("commands: start");

export function generateGpgKeys() {
  logger.highlight("Generating GPG keys...");

  try {
    const gpgVersion = execSync("gpg --version").toString();
    if (!gpgVersion.includes("gpg (GnuPG)")) {
      logger.warning("GPG is not installed on your system.");
      return;
    }

    execSync("gpg --full-generate-key", { stdio: "inherit" });
    logger.blue("GPG keys have been generated successfully.");
  } catch (error) {
    logger.error("Error:", error.message);
  }
}
