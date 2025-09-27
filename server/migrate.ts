
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function migrate() {
  try {
    // Add registration_number column if it doesn't exist
    await sql`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS registration_number TEXT;
    `;
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

migrate();
