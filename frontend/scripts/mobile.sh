#!/bin/bash

os_name=$(uname -s)

# Enable Xcode in the nix shell.
if [[ "$os_name" == "Darwin" && -d "/Applications/Xcode.app/Contents/Developer" ]]; then
  export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
  export PATH="/Applications/Xcode.app/Contents/Developer/usr/bin:$PATH"
fi

# Enable Android Studio in the nix shell.
if [ -d "$HOME/Library/Android/sdk" ]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  export PATH="$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH"
fi
