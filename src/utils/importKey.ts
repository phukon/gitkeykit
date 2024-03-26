import { execSync } from "child_process";

export function importKey(key: string): boolean {
  try {
    execSync(`gpg --import ${key}`, { stdio: "inherit" });
    return true; // Indicate success
  } catch (error: any) {
    throw new Error(`Error importing key: ${(error as Error).message}`);
  }
}
