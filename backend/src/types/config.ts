export interface ServerConfig {
  port: string;
}

export interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  ssl: boolean | string | object;
}

export interface AuthorizationConfig {
  jwtSecretKey: string;
}

export interface CorsConfig {
  origin: string;
  allowMethods: string[];
  allowHeaders: string[];
}

export interface Configuration {
  server: ServerConfig;
  database: DatabaseConfig;
  authorization: AuthorizationConfig;
  cors: CorsConfig;
  automigrate: {
    migrationsFolder: string;
  };
  environment: string;
}
