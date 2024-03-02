import { execSync } from "child_process";
import input from "@inquirer/input";
import { extractKey } from "./extractKey.js";
import createLogger from "../logger.js";
const logger = createLogger("commands: start");

export async function setGitConfig(gpgAgentAddress) {
  try {
    const username = await input({ message: "Enter your username (should match with your Git hosting provider.)" });
    execSync(`git config --global user.name "${username}"`);

    const email = await input({ message: "Enter your email (should match with your Git hosting provider and your GPG key credentials.)" });
    execSync(`git config --global user.email "${email}"`);

    logger.log("Setting up your key");
    const gpgLog = execSync("gpg --list-secret-keys").toString();
    const keyID = extractKey(gpgLog);
    execSync(`git config --global user.signingkey ${keyID}`);

    logger.log("Enabled commit signing");
    execSync("git config --global commit.gpgsign true");

    logger.log("Enabled tag signing");
    execSync("git config --global tag.gpgsign true");

    logger.log("Setting up gpg agent for Git globally.");
    execSync(`git config --global gpg.program "${gpgAgentAddress}"`);

    // List all global configurations
    const configList = execSync("git config --global --list", { encoding: "utf-8" });
    console.log("Git configurations set successfully:");
    console.log(configList);
  } catch (error) {
    console.error("Error occurred while setting Git configurations:", error);
  }
}

// Call the function to set Git configurations
setGitConfig();
