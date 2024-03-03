import { execSync } from "child_process";

export function importKey(key) {
  try {
    execSync(`gpg --import ${key}`, { stdio: "inherit" });
    return true; // Indicate success
  } catch (error) {
    throw new Error(`Error importing key: ${error.message}`);
  }
}
