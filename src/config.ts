import { MigrationConfig } from "drizzle-orm/migrator.cjs";

process.loadEnvFile();

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type APIConfig = {
  fileserverHits: number;
  db: DBConfig;
};

let config: APIConfig = {
  fileserverHits: 0,
  db: {
    url: process.env.DB_URL!,
    migrationConfig: {
      migrationsFolder: "src/db/out",
    },
  },
};

export { config };
