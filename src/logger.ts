import chalk from 'chalk';
import debug from 'debug';

interface Logger {
  log: (...args: any[]) => void;
  green: (...args: any[]) => void;
  blue: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warning: (...args: any[]) => void;
  white: (...args: any[]) => void;
  highlight: (...args: any[]) => void;
  debug: debug.Debugger;
}

export default function createLogger(name: string): Logger {
  return {
    log: (...args: any[]) => console.log(chalk.gray(...args)),
    green: (...args: any[]) => console.log(chalk.greenBright(...args)),
    blue: (...args: any[]) => console.log(chalk.blueBright(...args)),
    error: (...args: any[]) => console.log(chalk.redBright(...args)),
    warning: (...args: any[]) => console.log(chalk.yellow(...args)),
    white: (...args: any[]) => console.log(chalk.whiteBright(...args)),
    highlight: (...args: any[]) => console.log(chalk.magentaBright(...args)),
    debug: debug(name)
  };
}
