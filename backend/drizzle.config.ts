import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { getConfigurations } from "./src/config/init";
import { formatConnString } from "./src/database/connect";

const config = getConfigurations();

export default defineConfig({
  out: "./src/migrations",
  schema: "./src/entities/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: formatConnString(config.database),
  },
  migrations: {
    prefix: "timestamp",
  },
});
