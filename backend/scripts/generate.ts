/* This File Injects Custom Types DO NOT TOUCH WITHOUT PERMISSION
*/
import fs from "node:fs";
import { resolve } from "node:path";
import openapiTS, { astToString } from "openapi-typescript";

const PROJECT_ROOT = resolve(__dirname, "../..");
const BACKEND_DIR = `${PROJECT_ROOT}/backend/src/gen`;
const FRONTEND_DIR = `${PROJECT_ROOT}/frontend/gen`;

//Specification for OpenAPI and Generated Outputs
const spec = new URL(`${PROJECT_ROOT}/openapi.yaml`, import.meta.url);
const backendOutput = `${BACKEND_DIR}/openapi.d.ts`;
const frontendOutput = `${FRONTEND_DIR}/openapi.d.ts`;

const generate = async () => {
  if (!fs.existsSync(BACKEND_DIR)) {
    fs.mkdirSync(BACKEND_DIR);
  }

  if (!fs.existsSync(FRONTEND_DIR)) {
    fs.mkdirSync(FRONTEND_DIR);
  }
  const ast = await openapiTS(spec, {
    rootTypes: true,
  });
  const contents = astToString(ast);
  fs.writeFileSync(backendOutput, contents);
  fs.writeFileSync(frontendOutput, contents);
};

generate().then(() => {
  console.log(
    `.Successfully applied transformations and generated types. See ${BACKEND_DIR} and ${FRONTEND_DIR}`,
  );
});
