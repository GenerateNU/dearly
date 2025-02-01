#!/bin/bash

export BUN_INSTALL=$(pwd)
if [ ! -f "$BUN_INSTALL/bin/bun" ]; then
  curl -fsSL https://bun.sh/install | bash
fi
export PATH="$BUN_INSTALL/bin:$PATH"
