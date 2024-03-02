import os from "node:os";
import createLogger from "../logger.js";
import { exec } from "child_process";
const platform = os.platform();
const logger = createLogger("commands: start");

export function check() {
  logger.highlight("Operating System:", platform);

  exec("gpg --version", (error, stdout, stderr) => {
    if (error) {
      logger.error("Error:", error.message);
      return;
    }
    if (stderr) {
      logger.error("Error:", stderr);
      return;
    }

    if (stdout.includes("gpg (GnuPG)")) {
      logger.blue("GPG is installed on your system.");
    } else {
      logger.warning("GPG is not installed on your system.");
    }
  });

  if (platform == "win32") {
    exec("cmd /c where gpg", (error, stdout, stderr) => {
      if (error) {
        logger.error("Error:", error.message);
        return;
      }
      if (stderr) {
        logger.error("Error:", stderr);
        return;
      }

      const gpgPaths = stdout.trim().split("\r\n"); // Split by newline on Windows

      if (gpgPaths.length > 0) {
        logger.log("GPG program is located at:");
        gpgPaths.forEach((path) => logger.log(path));
      } else {
        logger.error("GPG program is not found on your system.");
      }
    });
  } else if (platform == "linux") {
    exec("which gpg", (error, stdout, stderr) => {
      if (error) {
        logger.error("Error:", error.message);
        return;
      }
      if (stderr) {
        logger.error("Error:", stderr);
        return;
      }

      const gpgPath = stdout.trim();
      if (gpgPath) {
        logger.log("GPG program is located at:", gpgPath);
      } else {
        logger.error("GPG program is not found on your system.");
      }
    });
  } else {
    process.exit(1)
  }
}

check();
