import type { MigrationConfig } from "drizzle-orm/migrator.cjs";

type Config = {
  api: APIConfig;
  db: DBConfig;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: string;
};

process.loadEnvFile();

const envOrThrow = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
};

export const config: Config = {
  api: {
    fileserverHits: 0,
    port: Number(envOrThrow("PORT")),
    platform: envOrThrow("PLATFORM"),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "src/db/out",
    },
  },
};
