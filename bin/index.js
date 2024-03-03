#!/usr/bin/env node
import arg from "arg";
import chalk from "chalk";
// import { start } from "../src/commands/_start.js";
import { start } from "../src/commands/start.js";
import { reset } from "../src/commands/reset.js";
// import { getConfig } from "../src/config/config-mgr.js";
import createLogger from "../src/logger.js";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
const logger = createLogger("bin");

async function main() {
  const args = arg({
    "--reset": Boolean,
    "--help": Boolean,
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
  } else {
    await start();
  }

  // testing
  // await delay(20000);
}

function usage() {
  console.log(`${chalk.whiteBright("tool [CMD]")}
  ${chalk.greenBright("--start")}\tStarts the app
  ${chalk.greenBright("--build")}\tBuilds the app`);
}

// testing
// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

main();
