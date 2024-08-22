import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config()
const SQL1 = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  status  VARCHAR(10)
);
`;

const SQL2 = `
CREATE TABLE IF NOT EXISTS message (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  user_id INTEGER,
  created_at TIMESTAMPTZ
);
`;

const SQL3 = `
CREATE TABLE IF EXISTS session (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");`

async function queryDatabase() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
      },
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database.');

    console.log('Executing SQL1...');
    await client.query(SQL1);
    console.log('SQL1 executed.');

    console.log('Executing SQL2...');
    await client.query(SQL2);
    console.log('SQL2 executed.');

    await client.query(SQL3);
    console.log('SQL3 executed.');

    console.log("Query success");
} catch (err) {
    if (err instanceof Error) {
        console.error('Error executing query', err.stack);
    } else {
        console.error('Unexpected error', err);
    }
} finally {
    await client.end();
    console.log('Client connection closed.');
}

}

queryDatabase();

