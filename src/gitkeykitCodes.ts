/**
 * Error codes for GitKeyKit operations
 */
export enum GitKeyKitCodes {
  // Success
  SUCCESS = 0,

  // Dependency Errors (1-2)
  ERR_GPG_NOT_FOUND = 1,
  ERR_GIT_NOT_FOUND = 2,

  // Input/Argument Errors (3-5)
  ERR_INVALID_ARGS = 3,
  ERR_NO_SECRET_KEYS = 4,
  ERR_INVALID_INPUT = 5,

  // Configuration Errors (6, 9-10)
  ERR_GIT_CONFIG = 6,
  ERR_GIT_CONFIG_RESET = 9,
  ERR_GPG_CONFIG_RESET = 10,

  // Key Operation Errors (7-8)
  ERR_KEY_GENERATION = 7,
  ERR_KEY_IMPORT = 8,

  // System Errors (11-12)
  ERR_HOME_DIRECTORY_NOT_FOUND = 11,
  ERR_BUFFER_OVERFLOW = 12,
}

export function getCodeMessage(code: GitKeyKitCodes): string {
  switch (code) {
    case GitKeyKitCodes.SUCCESS:
      return 'Operation completed successfully';
    case GitKeyKitCodes.ERR_GPG_NOT_FOUND:
      return 'GPG installation not found';
    case GitKeyKitCodes.ERR_GIT_NOT_FOUND:
      return 'Git installation not found';
    case GitKeyKitCodes.ERR_INVALID_ARGS:
      return 'Invalid arguments provided';
    case GitKeyKitCodes.ERR_NO_SECRET_KEYS:
      return 'No GPG secret keys found';
    case GitKeyKitCodes.ERR_INVALID_INPUT:
      return 'Invalid input provided';
    case GitKeyKitCodes.ERR_GIT_CONFIG:
      return 'Git configuration error';
    case GitKeyKitCodes.ERR_KEY_GENERATION:
      return 'Error generating GPG key';
    case GitKeyKitCodes.ERR_KEY_IMPORT:
      return 'Error importing GPG key';
    case GitKeyKitCodes.ERR_GIT_CONFIG_RESET:
      return 'Error resetting Git configuration';
    case GitKeyKitCodes.ERR_GPG_CONFIG_RESET:
      return 'Error resetting GPG configuration';
    case GitKeyKitCodes.ERR_HOME_DIRECTORY_NOT_FOUND:
      return 'Home directory not found';
    case GitKeyKitCodes.ERR_BUFFER_OVERFLOW:
      return 'Buffer overflow error';
    default:
      return 'Unknown error';
  }
}
