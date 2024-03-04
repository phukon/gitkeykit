import confirm from "@inquirer/confirm";
import { execSync } from "child_process";
import input from "@inquirer/input";
import { extractKey } from "./extractKey.js";
import createLogger from "../logger.js";
import boxen from "boxen";

const logger = createLogger("commands: Git Configuration");

export async function setGitConfig(gpgAgentAddress) {
  try {
    const username = await input({ message: "Enter your username (should match with your Git hosting provider)" });
    const email = await input({ message: "Enter your email (should match with your Git hosting provider and your GPG key credentials.)" });

    logger.log("Setting up your key");
    const gpgLog = execSync("gpg --list-secret-keys").toString();
    const keyID = extractKey(gpgLog);

    const content = `
      Configurations to be applied:
      
      user.name = ${username}
      user.email = ${email}
      user.signingkey = ${keyID}
      commit.gpgsign = true
      tag.gpgsign = true
      gpg.program = ${gpgAgentAddress}
  `;

    console.log(boxen(content, { padding: 1, borderStyle: "round", borderColor: "blue" }));
    const confirmation = await confirm({
      message: "Do you want to set this Git configuration? (yes/no)",
    });

    if (!confirmation) {
      console.log("Aborted. Git configurations were not set.");
      process.exit(1);
    }

    execSync(`git config --global user.name "${username}"`);
    execSync(`git config --global user.email "${email}"`);
    execSync(`git config --global user.signingkey ${keyID}`);
    execSync("git config --global commit.gpgsign true");
    execSync("git config --global tag.gpgsign true");
    execSync(`git config --global gpg.program "${gpgAgentAddress}"`);

    // List all global configurations
    // const configList = execSync("git config --global --list", { encoding: "utf-8" });
    logger.blue("Git configurations set successfully");
    // console.log(configList);
  } catch (error) {
    console.error("Error occurred while setting Git configurations:", error);
  }
}
