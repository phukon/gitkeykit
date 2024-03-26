#!/usr/bin/env node
import arg from "arg";
import chalk from "chalk";
import { start } from "../src/commands/start";
import { reset } from "../src/commands/reset";
import { importKey } from "../src/utils/importKey";
import createLogger from "../src/logger";
import boxen from 'boxen';

// import fs from "fs";
// import { promisify } from "util";
// import { start } from "../src/commands/_start.js";
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
const logger = createLogger("bin");
// const readFileAsync = promisify(fs.readFile);

async function main() {
  const args = arg({
    "--reset": Boolean,
    "--help": Boolean,
    "--import": String,
  });

  logger.debug("Received args", args);

  if (args["--reset"]) {
    try {
      reset();
    } catch (e: any) {
      logger.warning((e as Error).message);
      console.log();
      usage();
    }
  } else if (args["--help"]) {
    usage();
  } else if (args["--import"]) {
    const key = args["--import"];
    try {
      // const keyData = await readFileAsync(keyFilePath, "utf-8");
      await importKey(key);
      logger.log(`Imported key from ${key}`);
      await start()
    } catch (e) {
      console.error(`Error importing key from ${key}:`, e);
    }
  } else {
    await start();
  }

  // testing
  // await delay(20000);
}

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

// testing
// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

main();
