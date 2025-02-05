import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // SSL csak production környezetben (Replit)
  ssl: process.env.NODE_ENV === 'production' 
    ? {
        rejectUnauthorized: false
      } 
    : undefined,
  // Lokális fejlesztéshez hasznos beállítások
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Kapcsolat tesztelése induláskor
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    return;
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('Error executing query', err.stack);
      return;
    }
    console.log('Database connected successfully');
  });
});

export const db = drizzle(pool, { schema });
export { pool };