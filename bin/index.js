#!/usr/bin/env node
import fs from "fs";
import { promisify } from "util";
import arg from "arg";
import chalk from "chalk";
// import { start } from "../src/commands/_start.js";
import { start } from "../src/commands/start.js";
import { reset } from "../src/commands/reset.js";
import { importKey } from "../src/utils/importKey.js";
// import { getConfig } from "../src/config/config-mgr.js";
import createLogger from "../src/logger.js";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
const logger = createLogger("bin");
const readFileAsync = promisify(fs.readFile);

async function main() {
  const args = arg({
    "--reset": Boolean,
    "--help": Boolean,
    "--import": String,
  });

  logger.debug("Received args", args);

  if (args["--reset"]) {
    try {
      // const config = await getConfig();
      reset();
    } catch (e) {
      logger.warning(e.message);
      console.log();
      usage();
    }
  } else if (args["--help"]) {
    usage();
  } else if (args["--import"]) {
    const keyFilePath = args["--import"];
    try {
      const keyData = await readFileAsync(keyFilePath, "utf-8");
      await importKey(keyData);
      console.log(`Imported key from ${keyFilePath}`);
    } catch (e) {
      console.error(`Error importing key from ${keyFilePath}:`, e);
    }
  } else {
    await start();
  }

  // testing
  // await delay(20000);
}

function usage() {
  console.log("\n");
  console.log(chalk.whiteBright("GitKeyKit - Simplify PGP key🔑 setup and signing commits on Linux and Windows."));
  console.log(chalk.magenta("Usage: gitkeykit\n"));
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
  console.log(chalk.whiteBright("For more information, visit: [https://github.com/phukon/gitkeykit]"));
  console.log("\n");
}

// testing
// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

main();
