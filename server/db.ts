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
  // Pool beállítások a jobb teljesítményért és stabilitásért
  max: 20, // maximum 20 kapcsolat
  idleTimeoutMillis: 30000, // inactive connections are closed after 30 seconds
  connectionTimeoutMillis: 2000, // connect timeout after 2 seconds
  keepAlive: true, // keep connections alive
  keepAliveInitialDelayMillis: 10000 // delay before first keepalive
});

// Error handling for the pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Kapcsolat tesztelése induláskor
pool.connect()
  .then(client => {
    return client
      .query('SELECT NOW()')
      .then(result => {
        client.release();
        console.log('Database connected successfully');
      })
      .catch(err => {
        client.release();
        console.error('Error executing query', err.stack);
      });
  })
  .catch(err => {
    console.error('Error acquiring client', err.stack);
  });

export const db = drizzle(pool, { schema });
export { pool };