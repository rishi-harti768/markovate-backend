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
      account_type VARCHAR(255) NOT NULL DEFAULT 'CLIENT',
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      email_token VARCHAR(255),
      password_token VARCHAR(255),
      profile json,
      organ integer[] DEFAULT NULL
    );`;

  const organizationReg = `
    CREATE TABLE IF NOT EXISTS organization_reg (
      org_name VARCHAR(255) NOT NULL UNIQUE,
      inst_name VARCHAR(255) NOT NULL UNIQUE,
      org_host INTEGER NOT NULL,
      website VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(255) NOT NULL,
      mail_token VARCHAR(255),
      status varchar(255) NOT NULL DEFAULT 'Queued'
    );`;

  const organization = `
    CREATE TABLE IF NOT EXISTS organizations (
      org_id SERIAL PRIMARY KEY,
      org_name VARCHAR(255) NOT NULL UNIQUE,
      inst_name VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      status varchar(255) NOT NULL DEFAULT 'verification_pending',
      org_host VARCHAR(255) NOT NULL
    );`;

  try {
    pool.query(account);
    pool.query(organizationReg);
    pool.query(organization);
    console.log("Database Initialized");
  } catch (err) {
    if (err.code !== "42P07") {
      console.error("DBinit Error:" + err.message);
    }
  }
};

export default pool;
