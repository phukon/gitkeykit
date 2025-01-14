# 🧰 GitKeykit
![GitHub release (with filter)](https://img.shields.io/github/v/release/phukon/gitkeykit) ![npm downloads](https://img.shields.io/npm/dt/gitkeykit)

![for_preferred_anon-min](https://github.com/phukon/gitkeykit/assets/60285613/cfd6558a-61f3-4717-9dce-fccc41333525)


Simplify PGP key setup and signing commits on Linux and Windows.

## 📦 Installation

```bash
# Using npx (recommended)
npx gitkeykit 

# Or install globally
npm install -g gitkeykit 
```

## 🚀 Usage

### Basic Setup
```bash
# Start the interactive setup
gitkeykit

# Import existing PGP key
gitkeykit import my_key.txt

# Reset configurations
gitkeykit --reset

# Show version number
gitkeykit --verion

# Display help information and available commands
gitkeykit --help
```

### Command Options
- `--reset` Reset Git and GPG configurations
- `--help` Show help information
- `--version` Show version number
- `--import <key_path.txt>` Import and configure PGP key from file

## ✨ Features

- **Interactive Setup**: Guided process for creating or importing PGP keys
- **Cross-Platform**: Works seamlessly on both Linux and Windows
- **Secure Configuration**: 
  - Automatic Git signing setup
  - GPG agent configuration
  - Secure passphrase handling
- **Error Handling**: Clear error messages and recovery options
- **Backup & Reset**: Automatic backup of existing configurations with reset capability


## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.