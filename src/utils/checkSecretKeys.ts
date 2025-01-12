import { spawn } from 'child_process';
import { GitKeyKitCodes } from "../gitkeykitCodes";

/**
 * Checks if GPG secret keys exist on the system
 * @returns Promise that resolves to a GitKeyKitCodes value
 */
export async function checkSecretKeys(): Promise<GitKeyKitCodes> {
  return new Promise((resolve) => {
    const gpgProcess = spawn('gpg', ['--list-secret-keys']);
    let foundSecretKey = false;

    gpgProcess.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      if (output.includes('sec')) {
        foundSecretKey = true;
      }
    });

    gpgProcess.on('error', () => {
      resolve(GitKeyKitCodes.ERR_NO_SECRET_KEYS);
    });

    gpgProcess.on('close', () => {
      resolve(foundSecretKey ? 
        GitKeyKitCodes.SUCCESS : 
        GitKeyKitCodes.ERR_NO_SECRET_KEYS
      );
    });
  });
}