# Dearly

Behold the most chad Generate Project to ever Generate

![code-ql](https://github.com/GenerateNU/dearly/actions/workflows/codeql.yml/badge.svg)
![backend](https://github.com/GenerateNU/dearly/actions/workflows/backend.yml/badge.svg)
![frontend](https://github.com/GenerateNU/dearly/actions/workflows/frontend.yml/badge.svg)
![backend-deployed](https://github.com/GenerateNU/dearly/actions/workflows/build.yml/badge.svg)
![dependabot](https://img.shields.io/badge/dependencies-monitored-brightgreen)

![Repo Beats](https://repobeats.axiom.co/api/embed/3e93568ac88a6144752bbc72a8964e63e2f470b7.svg "Repobeats analytics image")

## Project Required Dependencies

### [Nix](https://nixos.org), the all in one package manager

```bash
# MacOS
sh <(curl -L https://nixos.org/nix/install)

# Linux
sh <(curl -L https://nixos.org/nix/install) --daemon
```

#### Troubleshooting with Nix

> [!WARNING]
> Recent MacOS installations of Sequoia have breaking changes with Nix.
> Follow the instructions to [uninstall](https://nix.dev/manual/nix/2.18/installation/uninstall),
> scroll down to the section under macOS.

#### Enable experimental builds

```bash
# Append any nix command with for temporary enablement of nix features
nix --experimental-features 'nix-command flakes' develop
```

> [!TIP]
> Configure [Nix](https://wiki.nixos.org/wiki/Flakes) to allow experimental-features

#### Run Nix

```bash
# In the root directory
nix develop
```

> [!NOTE]
> If you get an error saying ```error: experimental Nix feature 'nix-command' is disabled; add '--extra-experimental-features nix-command' to enable it``` you can edit the file directly from the path /etc/nix/nix.conf or ~/.config/nix/nix.conf and add ```experimental-features = nix-command flakes```

#### Download Docker Desktop

Install docker desktop from [here](https://www.docker.com/products/docker-desktop/). You do not need to make an account.

#### Test Everything Works

While in the nix flake, run ```task test```. Make sure that all tests pass.

### Mobile Development

- `macOS`, utilize [Xcode](https://developer.apple.com/xcode/) to natively run IOS emulators
- `Linux` utilize [Android Studio](https://developer.android.com) to natively run android emulators

> [!NOTE]
> The nix shell script attempts to pass up ios or android sdks into the nix shell, so install xcode or android locally to be able to
> run simulators in the shell.
