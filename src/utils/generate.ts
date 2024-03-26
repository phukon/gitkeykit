import { execSync } from "child_process";
import createLogger from "../logger";

const logger = createLogger("commands: generate");

export async function generateGpgKeys(): Promise<void> {
  logger.highlight("Generating GPG keys...");

  try {
    const gpgVersion = execSync("gpg --version").toString();
    if (!gpgVersion.includes("gpg (GnuPG)")) {
      logger.warning("GPG is not installed on your system.");
      return;
    }

    execSync("gpg --full-generate-key", { stdio: "inherit" });
    logger.blue("GPG keys have been generated successfully.");
  } catch (error: any) {
    logger.error("Error:", (error as Error).message);
  }
}
