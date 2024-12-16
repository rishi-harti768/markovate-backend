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
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      account_type smallint NOT NULL DEFAULT 0,
      email_token VARCHAR(255),
      password_token VARCHAR(255),
      username VARCHAR(255) UNIQUE,
      org_id VARCHAR(255)
    );`;
  const organization = ` 
    CREATE TABLE IF NOT EXISTS organizations (
      org_id SERIAL PRIMARY KEY,
      org_name VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      approved BOOLEAN NOT NULL DEFAULT FALSE
    );`;
  try {
    pool.query(account);
    pool.query(organization);
    console.log("Database Initialized");
  } catch (err) {
    if (err.code !== "42P07") {
      console.error("DBinit Error:" + err.message);
    }
  }
};

export default pool;
