import { spawn } from "child_process";

export async function importKey(keyData) {
  return new Promise((resolve, reject) => {
    const gpgProcess = spawn("gpg", ["--import"]);

    gpgProcess.on("error", (err) => {
      reject(err);
    });

    gpgProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`GPG process exited with code ${code}`));
      }
    });

    gpgProcess.stdin.write(keyData);
    gpgProcess.stdin.end();
  });
}
