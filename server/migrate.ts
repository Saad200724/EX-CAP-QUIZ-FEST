
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
    
    // Add unique constraint to student_id if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'registrations_student_id_unique'
        ) THEN
          ALTER TABLE registrations 
          ADD CONSTRAINT registrations_student_id_unique UNIQUE (student_id);
        END IF;
      END $$;
    `;
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

migrate();
