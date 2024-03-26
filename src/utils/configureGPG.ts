import { execSync } from "child_process";
import { appendFileSync, existsSync, mkdirSync } from "fs";
import boxen from "boxen";
import os from "os";
import path from "path";
// import createLogger from "../logger"; 
// const logger = createLogger("commands: checkSecretKeys");

// Function to append content to a file
function appendToFile(filePath: string, content: string) {
  appendFileSync(filePath, `${content}${os.EOL}`);
}

function addConfigToGPGConf() {
  const gpgConfPath: string = path.join(os.homedir(), ".gnupg", "gpg.conf");

  // Create .gnupg directory if it doesn't exist
  if (!existsSync(path.dirname(gpgConfPath))) {
    mkdirSync(path.dirname(gpgConfPath), { recursive: true });
  }

  // Clear gpg.conf if it exists
  if (existsSync(gpgConfPath)) {
    execSync(`echo -n > ${gpgConfPath}`);
  } else {
    // Create gpg.conf if it doesn't exist
    execSync(`touch ${gpgConfPath}`);
  }

  // Add configurations to gpg.conf
  appendToFile(gpgConfPath, "use-agent");
  appendToFile(gpgConfPath, "pinentry-mode loopback");
}

// Function to restart gpg-agent
async function restartGPGAgent() {
  try {
    await execSync("gpgconf --kill gpg-agent");
    console.log("gpg-agent killed.");
  } catch (error) {
    console.error("Error restarting gpg-agent:", error);
  }
}

// Function to start gpg-agent
async function startGPGAgent() {
  try {
    await execSync("gpg-agent --daemon");
    console.log("gpg-agent restarted.");
  } catch (error) {
    console.error("Error starting gpg-agent:", error);
  }
}

// Main
export async function configureGPG() {
  await addConfigToGPGConf();
  await restartGPGAgent();
  await startGPGAgent();
  const message = `
  Changes written to GPG config. (~/.gnupg/gpg.conf)

  > use-agent
  > pinentry-mode loopback
  `;
  console.log(boxen(message, { padding: 1, borderStyle: "round", borderColor: "blue" }));
  // try {
  //   const verifyOutput = execSync("cat ~/.gnupg/gpg.conf").toString();
  //   console.log("gpg.conf verified:");
  //   console.log(verifyOutput);
  // } catch (error) {
  //   console.error("Error verifying gpg.conf:", error);
  // }
}
