import { execSync } from "child_process";
import { appendFileSync, existsSync, mkdirSync } from "fs";
import os from "os";
import path from "path";

// Function to append content to a file
function appendToFile(filePath, content) {
  appendFileSync(filePath, `${content}${os.EOL}`);
}

// Function to add configurations to gpg.conf
function addConfigToGPGConf() {
  const gpgConfPath = path.join(os.homedir(), ".gnupg", "gpg.conf");

  // Create .gnupg directory if it doesn't exist
  if (!existsSync(path.dirname(gpgConfPath))) {
    mkdirSync(path.dirname(gpgConfPath), { recursive: true });
  }

  // Create gpg.conf if it doesn't exist
  if (!existsSync(gpgConfPath)) {
    execSync(`touch ${gpgConfPath}`);
  }

  // Add configurations to gpg.conf
  appendToFile(gpgConfPath, "use-agent");
  appendToFile(gpgConfPath, "pinentry-mode loopback");
}

// Function to restart gpg-agent
function restartGPGAgent() {
  try {
    execSync("gpgconf --kill gpg-agent");
    console.log("gpg-agent restarted.");
  } catch (error) {
    console.error("Error restarting gpg-agent:", error);
  }
}

// Function to start gpg-agent
function startGPGAgent() {
  try {
    execSync("gpg-agent --daemon");
    console.log("gpg-agent started.");
  } catch (error) {
    console.error("Error starting gpg-agent:", error);
  }
}

// Main function to perform all tasks
export function configureGPG() {
  addConfigToGPGConf();
  restartGPGAgent();
  startGPGAgent();

  // Command to verify gpg.conf
  try {
    const verifyOutput = execSync("cat ~/.gnupg/gpg.conf").toString();
    console.log("gpg.conf verified:");
    console.log(verifyOutput);
  } catch (error) {
    console.error("Error verifying gpg.conf:", error);
  }
}
