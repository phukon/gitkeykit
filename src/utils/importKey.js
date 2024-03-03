import { execSync } from "child_process";

export function importKey(keyData) {
  try {
    execSync(`gpg --import`, { input: keyData, stdio: "inherit" });
    return true; // Indicate success
  } catch (error) {
    throw new Error(`Error importing key: ${error.message}`);
  }
}
