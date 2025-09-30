// Load environment variables from .env file in development
// In production, environment variables should be set by the system
// If .env doesn't exist, dotenv will silently skip loading
import "dotenv/config";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('🔧 Using DATABASE_URL:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***@'));

// Production-ready connection pool configuration
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: true } // Secure SSL in production
    : { rejectUnauthorized: false }, // Allow self-signed certs in development
  // Connection pool settings for reliability
  max: 20, // Maximum number of connections in the pool
  min: 2,  // Minimum number of connections to maintain
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Wait up to 5 seconds for connection
  // Retry configuration
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
  console.log('Pool will attempt to reconnect automatically...');
});

// Connection health check
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

// Test the connection on startup
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  } else {
    console.log('🗄️ Database connection verified at:', result.rows[0].now);
  }
});

export const db = drizzle({ client: pool, schema });
