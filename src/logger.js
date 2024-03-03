import chalk from 'chalk';
import debug from 'debug';

export default function createLogger(name) {
  return {
    log: (...args) => console.log(chalk.gray(...args)),
    green: (...args) => console.log(chalk.greenBright(...args)),
    blue: (...args) => console.log(chalk.blueBright(...args)),
    error: (...args) => console.log(chalk.redBright(...args)),
    warning: (...args) => console.log(chalk.yellow(...args)),
    highlight: (...args) => console.log(chalk.bgGreenBright(...args)),
    debug: debug(name)
  };
};
