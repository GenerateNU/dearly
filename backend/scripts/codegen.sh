#!/bin/bash

OPENAPI_SPEC="../openapi.yaml"
GEN_OUTPUT="src/gen/schema.d.ts"
ZOD_OUTPUT="src/gen/generated_zod.ts"
GEN_DIR="src/gen"

function generate {
  bun "scripts/generate.ts"
  bun ts-to-zod $GEN_OUTPUT $ZOD_OUTPUT
}

if [ -d $GEN_DIR ]; then
  generate
else
  mkdir $GEN_DIR
  generate
fi
