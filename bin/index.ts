#!/usr/bin/env node
import arg from "arg";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import boxen from "boxen";
import { start } from "../src/commands/start";
import { reset } from "../src/commands/reset";
import { importKey } from "../src/commands/import";
import { GitKeyKitError, GitKeyKitCodes } from "../src/gitkeykitCodes";
import createLogger from "../src/utils/logger";

const logger = createLogger("bin");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf8"));
const { version } = packageJson;

function usage() {
  const usageLines = [
    "\n",
    chalk.blueBright(boxen("GitKeyKit - Simplify PGP key🔑 setup and signing commits on Linux and Windows machines.", { padding: 1, borderStyle: "round" })),
    chalk.whiteBright("Usage: gitkeykit\n"),
    chalk.whiteBright("Options:"),
    chalk.blueBright("--reset\t\t\tReset Git and GPG configurations"),
    chalk.whiteBright("\nFeatures:"),
    chalk.whiteBright("- Creates or imports PGP keys"),
    chalk.whiteBright("- Handles differences between Linux and Windows machines"), 
    chalk.whiteBright("- Configures Git and GPG settings"),
    chalk.whiteBright("- Sets pinentry mode to loopback for secure passphrase entry"),
    chalk.whiteBright("- Fast and efficient operation\n"),
    chalk.whiteBright("Commands:"),
    chalk.blueBright("import <key_path.txt>\t\tImport and set configuration with the provided PGP key"),
    chalk.whiteBright("\nExamples:"),
    chalk.blueBright("gitkeykit import my_key.txt\tImport and set configuration with 'my_key.txt'"),
    chalk.blueBright("gitkeykit --reset\t\tReset all configurations\n"),
    "\n"
  ];

  for (const line of usageLines) {
    console.log(line);
  }
}

async function handleImport(keyPath: string): Promise<void> {
  try {
    await importKey(keyPath);
    logger.log(`Imported key from ${keyPath}`);
    await start();
  } catch (error) {
    if (error instanceof GitKeyKitError) {
      throw error;
    }
    throw new GitKeyKitError(`Failed to import key from ${keyPath}`, GitKeyKitCodes.KEY_IMPORT_ERROR, error);
  }
}

async function handleReset(): Promise<void> {
  try {
    await reset();
  } catch (error) {
    if (error instanceof GitKeyKitError) {
      throw error;
    }
    throw new GitKeyKitError("Failed to reset configurations", GitKeyKitCodes.GIT_CONFIG_RESET_ERROR, error);
  }
}

async function main(): Promise<void> {
  try {
    const args = arg({
      "--reset": Boolean,
      "--help": Boolean,
      "--import": String,
      "--version": Boolean,
    });

    logger.debug("Received args", args);

    if (Object.keys(args).length === 1) {
      await start();
      return;
    }

    if (args["--reset"]) {
      await handleReset();
      return;
    }

    if (args["--help"]) {
      usage();
      return;
    }

    if (args["--import"]) {
      const keyPath = args["--import"];
      await handleImport(keyPath);
      return;
    }

    if (args["--version"]) {
      console.log(`v${version}`);
      return;
    }

    usage();
  } catch (error) {
    if (error instanceof arg.ArgError && error?.code === "ARG_UNKNOWN_OPTION") {
      logger.error(`Invalid argument: ${error.message}`);
      console.log("------");
      usage();
      process.exit(1);
    }

    if (error instanceof GitKeyKitError) {
      logger.error(`Error: ${error.message} (${error.code})`);
      if (error.details) {
        logger.debug("Error details:", error.details);
      }
      process.exit(1);
    }

    logger.error("An unexpected error occurred:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
