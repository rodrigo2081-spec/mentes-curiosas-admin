import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __mcDbClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está configurada. Revisá tu archivo .env.");
}

// Reuse the connection across hot reloads / serverless invocations.
const client =
  global.__mcDbClient ??
  postgres(connectionString, {
    ssl: connectionString.includes("localhost") ? false : "require",
    max: 1,
  });

if (process.env.NODE_ENV !== "production") {
  global.__mcDbClient = client;
}

export const db = drizzle(client, { schema });
