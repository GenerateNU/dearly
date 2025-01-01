import * as fs from "fs";
import path from "path";
import * as yaml from "yaml";

/**
 * Attempts to read the local openapi specification and translate that into
 * a proper API specification, *NOTE* It is generally bad to do read and write operations
 * at run time.
 */
export const getOpenAPISpecification = (): string => {
  try {
    const yamlLocation = path.resolve(__dirname, "../../../openapi.yaml");
    const yamlSpec = fs.readFileSync(yamlLocation, "utf-8");
    const openapiSpec = yaml.parse(yamlSpec);
    return openapiSpec;
  } catch (error) {
    console.error(error);
    return "";
  }
};
