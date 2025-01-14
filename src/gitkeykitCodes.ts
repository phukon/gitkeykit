export class GitKeyKitError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
    // NOTE: no need to manually assign 'this.code = code'
    // because the 'public' keyword does it automatically,
    // it's a Typescript feature!
  ) {
    super(message);
    this.name = 'GitKeyKitError';
    Object.setPrototypeOf(this, GitKeyKitError.prototype);
  }
}

/**
 * Error codes for GitKeyKit operations
 */
export const GitKeyKitCodes = {
  // Success
  SUCCESS: 'SUCCESS',

  // Dependency Errors
  GPG_NOT_FOUND: 'GPG_NOT_FOUND',
  GIT_NOT_FOUND: 'GIT_NOT_FOUND',

  // Input/Argument Errors
  INVALID_ARGS: 'INVALID_ARGS',
  NO_SECRET_KEYS: 'NO_SECRET_KEYS',
  INVALID_INPUT: 'INVALID_INPUT',

  // Configuration Errors
  GIT_CONFIG_ERROR: 'GIT_CONFIG_ERROR',
  GIT_CONFIG_RESET_ERROR: 'GIT_CONFIG_RESET_ERROR',
  GPG_CONFIG_RESET_ERROR: 'GPG_CONFIG_RESET_ERROR',

  // Key Operation Errors
  KEY_GENERATION_ERROR: 'KEY_GENERATION_ERROR',
  KEY_IMPORT_ERROR: 'KEY_IMPORT_ERROR',

  // System Errors
  HOME_DIR_NOT_FOUND: 'HOME_DIR_NOT_FOUND'
} as const;

export type GitKeyKitCodeType = typeof GitKeyKitCodes[keyof typeof GitKeyKitCodes];

export function getErrorMessage(code: GitKeyKitCodeType): string {
  const messages = {
    [GitKeyKitCodes.SUCCESS]: 'Operation completed successfully',
    [GitKeyKitCodes.GPG_NOT_FOUND]: 'GPG installation not found',
    [GitKeyKitCodes.GIT_NOT_FOUND]: 'Git installation not found',
    [GitKeyKitCodes.INVALID_ARGS]: 'Invalid arguments provided',
    [GitKeyKitCodes.NO_SECRET_KEYS]: 'No secret GPG keys found',
    [GitKeyKitCodes.INVALID_INPUT]: 'Invalid input provided',
    [GitKeyKitCodes.GIT_CONFIG_ERROR]: 'Error configuring Git settings',
    [GitKeyKitCodes.GIT_CONFIG_RESET_ERROR]: 'Error resetting Git configuration',
    [GitKeyKitCodes.GPG_CONFIG_RESET_ERROR]: 'Error resetting GPG configuration',
    [GitKeyKitCodes.KEY_GENERATION_ERROR]: 'Error generating GPG key',
    [GitKeyKitCodes.KEY_IMPORT_ERROR]: 'Error importing GPG key',
    [GitKeyKitCodes.HOME_DIR_NOT_FOUND]: 'Home directory not found',
  };
  return messages[code] || 'Unknown error';
}
