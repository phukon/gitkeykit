#!/usr/bin/env node
import arg from "arg";
import chalk from "chalk";
import { start } from "../src/commands/start";
import { reset } from "../src/commands/reset";
import { importKey } from "../src/utils/importKey";
import createLogger from "../src/logger";
import boxen from 'boxen';
import { GitKeyKitCodes } from "../src/gitkeykitCodes";

// Setup process handlers
process.on("SIGINT", () => process.exit(GitKeyKitCodes.SUCCESS));
process.on("SIGTERM", () => process.exit(GitKeyKitCodes.SUCCESS));

const logger = createLogger("bin");

function usage() {
  console.log("\n");
  console.log(chalk.blueBright(boxen('GitKeyKit - Simplify PGP key🔑 setup and signing commits on Linux and Windows.', {padding: 1, borderStyle: 'round'})));
  console.log(chalk.whiteBright("Usage: gitkeykit\n"));
  console.log(chalk.whiteBright("Options:"));
  console.log(chalk.blueBright("--reset\t\t\tReset Git and GPG configurations"));
  console.log(chalk.whiteBright("\nFeatures:"));
  console.log(chalk.whiteBright("- Creates or imports PGP keys"));
  console.log(chalk.whiteBright("- Handles differences between Linux and Windows machines"));
  console.log(chalk.whiteBright("- Configures Git and GPG settings"));
  console.log(chalk.whiteBright("- Sets pinentry mode to loopback for secure passphrase entry"));
  console.log(chalk.whiteBright("- Fast and efficient operation\n"));
  console.log(chalk.whiteBright("Commands:"));
  console.log(chalk.blueBright("import <key_path.txt>\t\tImport and set configuration with the provided PGP key"));
  console.log(chalk.whiteBright("\nExamples:"));
  console.log(chalk.blueBright("gitkeykit import my_key.txt\tImport and set configuration with 'my_key.txt'"));
  console.log(chalk.blueBright("gitkeykit --reset\t\tReset all configurations\n"));
  console.log("\n");
}

async function handleImport(keyPath: string): Promise<number> {
  try {
    await importKey(keyPath);
    logger.log(`Imported key from ${keyPath}`);
    await start();
    return GitKeyKitCodes.SUCCESS;
  } catch (error) {
    console.error(`Error importing key from ${keyPath}:`, error);
    return GitKeyKitCodes.ERR_KEY_IMPORT;
  }
}

async function handleReset(): Promise<number> {
  try {
    reset();
    return GitKeyKitCodes.SUCCESS;
  } catch (error: any) {
    logger.warning((error as Error).message);
    console.log();
    usage();
    return GitKeyKitCodes.ERR_GIT_CONFIG_RESET;
  }
}

async function main(): Promise<number> {
  const args = arg({
    "--reset": Boolean,
    "--help": Boolean,
    "--import": String,
  });

  logger.debug("Received args", args);

  // Handle commands similar to C version
  if (Object.keys(args).length === 1) {
    await start();
    return GitKeyKitCodes.SUCCESS;
  }

  if (args["--reset"]) {
    return handleReset();
  }

  if (args["--help"]) {
    usage();
    return GitKeyKitCodes.SUCCESS;
  }

  if (args["--import"]) {
    const keyPath = args["--import"];
    return handleImport(keyPath);
  }

  usage();
  return GitKeyKitCodes.ERR_INVALID_ARGS;
}

// Execute and handle exit codes
main()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
