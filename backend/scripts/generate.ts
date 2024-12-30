/* This File Injects Custom Types DO NOT TOUCH WITHOUT PERMISSION*/
import fs from "node:fs";
import { resolve } from "node:path";
import openapiTS, { astToString } from "openapi-typescript";

const PROJECT_ROOT = resolve(__dirname, "../..");

//Specification for OpenAPI and Generated Outputs
const spec = new URL(`${PROJECT_ROOT}/openapi.yaml`, import.meta.url);
const output = `${PROJECT_ROOT}/backend/src/gen/schema.d.ts`;

const generate = async () => {
  const ast = await openapiTS(spec, {});
  const contents = astToString(ast);
  fs.writeFileSync(output, contents);
};

generate().then(() => {
  console.log("Successfully applied transformations and generated types. See src/gen/");
});
