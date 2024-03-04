# 🧰 GitKeykit
![GitHub release (with filter)](https://img.shields.io/github/v/release/phukon/gitkeykit) ![npm downloads](https://img.shields.io/npm/dt/gitkeykit)

![for_preferred_anon-min](https://github.com/phukon/gitkeykit/assets/60285613/cfd6558a-61f3-4717-9dce-fccc41333525)


Simplify PGP key setup and signing commits on Linux and Windows.

## 📦 Usage

```bash
npx gitkeykit 
```
or
```bash
npm install -g gitkeykit 
```

## Features

- **Effortless PGP Key Management**: Create or import PGP keys with ease to secure your Git commits.
- **Cross-Platform Compatibility**: Works seamlessly on both Linux and Windows machines, ensuring a consistent experience across environments.
- **Git and GPG Configuration**: Automatically configure Git and GPG settings for seamless integration with your workflow.
- **Secure Passphrase Entry**: Enhance security with pinentry-mode loopback, ensuring passphrases are entered securely.
- **Fast and Efficient Operation**: Enjoy a lightning-fast CLI tool that gets the job done quickly and efficiently.



#### Options:
  `--reset` Reset Git and GPG configurations

#### Commands:
  `import <key_path.txt>`    Import and set configuration with the provided PGP key

Examples:
  `gitkeykit import my_key.txt`    Import and set configuration with 'my_key.txt'
  `gitkeykit --reset`             Reset all configurations` 
