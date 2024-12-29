import pool from "../config/db.conf.js";
import { sendOrgFormEmail } from "../services/email.service.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const newOrgReg = async (req, res) => {
  try {
    const id = req.userCred;
    let { org_name, inst_name, website, email, phone } = req.body;

    // check empty fields
    if (!org_name || !inst_name || !website || !email || !phone) {
      return res.status(200).send("EMPTY_FIELDS");
    }

    // check acc exists
    const searchAcc = await pool.query(
      `SELECT id FROM accounts WHERE id = $1`,
      [id]
    );

    if (searchAcc.rows.length != 1) {
      return res.status(200).send("ACCOUNT_NOT_FOUND");
    }

    // check email format
    email = email.trim();
    if (!isValidEduEmail(email)) {
      return res.status(200).send("INVALID_EMAIL_FORMAT");
    }

    // check valid website url
    website = isValidURL(website);
    if (!website) {
      return res.status(200).send("INVALID_WEBSITE_FORMAT");
    }

    res.send("");

    /* if (!email) {
      return res.status(200).send("EMPTY_FIELDS");
    }

    email = email.trim();

    if (!isValidEduEmail(email)) {
      return res.status(200).send("INVALID_EMAIL_FORMAT");
    }

    const token = crypto.randomBytes(64).toString("hex");

    try {
      const addregform = await pool.query(
        `INSERT INTO organization_reg (edu_email, mail_token) VALUES ($1, $2);`,
        [email, token]
      );
    } catch (error) {
      if (error.code === "23505") {
        return res.status(200).send("EMAIL_ALREADY_EXISTS");
      }
    }

    await sendOrgFormEmail(email, token);

    res.status(200).send("EMAIL_SENT"); */
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const isValidEduEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidURL = (link) => {
  let url;
  try {
    url = new URL(link.trim());
  } catch (e) {
    return false;
  }
  return url.href;
};
