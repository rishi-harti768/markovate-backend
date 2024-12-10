import pool from "../config/db.conf.js";
import { sendEmailVerificationEmail } from "../services/email.service.js";
import crypto from "crypto";

export const fetchuser = async (req, res) => {
  try {
    const { id } = req.body;
    // check if acc exists
    const users = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [
      id,
    ]);
    if (users.rows.length != 1) {
      res.status(400).send("ACCOUNT_NOT_FOUND");
      return;
    }
    const account = users.rows[0];
    //check if acc is verified
    if (!account.verified) {
      res.status(400).send("ACCOUNT_NOT_VERIFIED");
      return;
    }
    //check account type
    let type = "admin";
    if (account.account_type == 1) {
      type = "student";
    } else if (account.account_type == 2) {
      type = "teacher";
    } else if (account.account_type == 3) {
      type = "admin";
    } else {
      res.status(400).send("INVALID_ACCOUNT_TYPE");
      return;
    }
    res.status(200).json({ mes: type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const emailVerificationBefore = async (req, res) => {
  try {
    const { id } = req.body;
    // check if acc exists
    const searchAcc = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [
      id,
    ]);
    if (searchAcc.rows.length != 1) {
      res.status(400).send("ACCOUNT_NOT_FOUND");
      return;
    }
    // is acc already verified
    if (searchAcc.rows[0].verified) {
      res.status(400).send("ACCOUNT_ALREADY_VERIFIED");
      return;
    }
    // send verification email
    const token = crypto.randomBytes(16).toString("hex");
    const grantemail = await pool.query(
      `UPDATE accounts SET email_token = $1 WHERE id = $2`,
      [token, id]
    );
    // sendEmailVerificationEmail(searchAcc.rows[0].email, token);
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const emailVerificationAfter = async (req, res) => {
  try {
    const { id, token } = req.body;
    // check if acc exists
    const searchAcc = await pool.query(
      `SELECT * FROM accounts WHERE id = $1;`,
      [id]
    );
    if (searchAcc.rows.length != 1) {
      res.status(400).send("ACCOUNT_NOT_FOUND");
      return;
    }

    // check token
    if (searchAcc.rows[0]["email_token"] != token) {
      res.status(400).send("INCORRECT_TOKEN");
      return;
    }

    const grantemail = await pool.query(
      `UPDATE accounts SET email_token = null, verified = true WHERE id = $1`,
      [id]
    );

    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
