import { config } from "dotenv";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { readFileSync } from 'fs';
import path from 'path';

// Force load from .env file to override Replit system environment variables
const envPath = path.resolve(process.cwd(), '.env');
let envFileUrl: string | undefined;
try {
  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^DATABASE_URL=(.+)$/m);
  if (match) {
    envFileUrl = match[1].trim();
  }
} catch (e) {
  // .env file doesn't exist, use system env
}

// Use .env file DATABASE_URL if it exists, otherwise fall back to system env
const databaseUrl = envFileUrl || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log(`🔗 Connecting to database: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);

export const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzle({ client: pool, schema });
