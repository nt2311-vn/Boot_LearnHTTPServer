process.loadEnvFile();

type APIConfig = {
  fileserverHits: number;
  dbURL: string;
};

let config: APIConfig = {
  fileserverHits: 0,
  dbURL: process.env.DB_URL!,
};

export { config };
