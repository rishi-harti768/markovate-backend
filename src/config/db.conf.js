import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on("error", (err) => {
  console.log("error connecting to db", err.message);
});

export const DBinit = () => {
  const account = `
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      account_type smallint NOT NULL DEFAULT 0,
      email_token VARCHAR(100),
      password_token VARCHAR(100)
    );`;

  try {
    pool.query(account);
    console.log("Database Initialized");
  } catch (err) {
    console.error("DBinit Error:" + err.message);
  }
};

export default pool;
