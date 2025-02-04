#!/bin/bash

export BUN_INSTALL=$(pwd)
if [ ! -f "$BUN_INSTALL/bin/bun" ]; then
  curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.2"
fi
export PATH="$BUN_INSTALL/bin:$PATH"
