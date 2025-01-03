#!/bin/bash

OPENAPI_SPEC="../openapi.yaml"
GEN_DIR="src/gen"

function generate {
  bun "scripts/generate.ts"
}

if [ -d $GEN_DIR ]; then
  generate
else
  mkdir $GEN_DIR
  generate
fi
