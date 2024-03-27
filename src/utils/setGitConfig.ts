import confirm from "@inquirer/confirm";
import { execSync } from "child_process";
import input from "@inquirer/input";
import { extractKey } from "./extractKey";
import createLogger from "../logger";
import boxen from "boxen";

const logger = createLogger("commands: Git Configuration");

export async function setGitConfig(gpgAgentAddress: string[]): Promise<void> {
  try {
    const username: string = await input({ message: "Enter your username (should match with your Git hosting provider)" });
    const email: string = await input({ message: "Enter your email (should match with your Git hosting provider and your GPG key credentials.)" });

    logger.log("Setting up your key");
    const gpgLog: string = execSync("gpg --list-secret-keys").toString();
    const keyID: string | null = extractKey(gpgLog);

    if (!keyID) {
      logger.error("Error: Unable to extract GPG key ID.");
      return;
    }

    const content: string = `
      Configurations to be applied:
      
      user.name = ${username}
      user.email = ${email}
      user.signingkey = ${keyID}
      commit.gpgsign = true
      tag.gpgsign = true
      gpg.program = ${gpgAgentAddress.join('')}
  `;

    console.log(boxen(content, { padding: 1, borderStyle: "round", borderColor: "blue" }));
    const confirmation: boolean = await confirm({
      message: "Do you want to set this Git configuration? (yes/no)",
    });

    if (!confirmation) {
      console.log("Aborted. Git configurations were not set.");
      return;
    }

    execSync(`git config --global user.name "${username}"`);
    execSync(`git config --global user.email "${email}"`);
    execSync(`git config --global user.signingkey ${keyID}`);
    execSync("git config --global commit.gpgsign true");
    execSync("git config --global tag.gpgsign true");
    execSync(`git config --global gpg.program "${gpgAgentAddress.join('')}"`);

    logger.blue("Git configurations set successfully");
  } catch (error: any) {
    logger.error("Error occurred while setting Git configurations:", error.message);
  }
}
