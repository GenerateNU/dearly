/**
 * Retrieves an environment variable by name. Throws an error if not defined.
 * @param {string} envVarName - Name of the environment variable.
 * @param {string} [defaultValue] - Optional default value to return if the variable is not found.
 * @returns {string} The environment variable's value.
 * @throws Will throw an error if the environment variable is missing and no default is provided.
 */
export const parseEnv = (envVarName: string, defaultValue?: string): string => {
  const value = process.env[envVarName] || defaultValue || "";
  if (!value) {
    throw new Error(`Missing required environment variable: ${envVarName}`);
  }
  return value;
};

/**
 * Parses the value of the SSL environment variable.
 * @param {string} value - Value of the SSL environment variable.
 * @returns {boolean | "require"} SSL status: boolean or "require".
 */
export const parseSSL = (value: string): boolean | "require" => {
  const lowerValue = value.toLowerCase();
  if (lowerValue === "true") return true;
  if (lowerValue === "false") return false;
  if (lowerValue === "require") return lowerValue;
  throw new Error(`Invalid value for SSL environment variable`);
};
