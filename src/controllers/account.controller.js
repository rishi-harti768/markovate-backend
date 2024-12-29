import pool from "../config/db.conf.js";
import { sendEmailVerificationEmail } from "../services/email.service.js";
import crypto from "crypto";

export const getDashboard = async (req, res) => {
  try {
    const id = req.userCred;

    // check if acc exists
    const { rows } = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [
      id,
    ]);

    if (rows.length !== 1) {
      return res.status(200).send("ACCOUNT_NOT_FOUND");
    }

    const account = rows[0];

    // check if acc is verified
    if (!account.verified) {
      return res.status(200).send("ACCOUNT_NOT_VERIFIED");
    }

    return res.status(200).send({
      orgs: account.organ === null ? [] : account.organ,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmailSendEmail = async (req, res) => {
  try {
    const id = req.userCred;

    const { action } = req.body;

    if (!id || !action) {
      return res.status(200).send("MISSING_FIELDS");
    }

    const acc = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [id]);

    if (action === "mail") {
      // is acc already verified
      if (acc.rows[0].verified) {
        return res.status(200).send("ACCOUNT_ALREADY_VERIFIED");
      }

      // send verification email
      const token = crypto.randomBytes(16).toString("hex");
      const grantemail = await pool.query(
        `UPDATE accounts SET email_token = $1 WHERE id = $2 RETURNING email`,
        [token, id]
      );
      sendEmailVerificationEmail(id, grantemail.rows[0].email, token);

      return res.status(200).send("EMAIL_VERIFICATION_SENT");
    } else if (action === "check") {
      // is acc already verified
      return res.status(200).send({ verified: acc.rows[0].verified });
    } else {
      throw new Error("Invalid action");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmailCheck = async (req, res) => {
  try {
    const { id, token } = req.body;
    if (!id || !token) {
      return res.status(200).send("MISSING_FIELDS");
    }

    // check if acc exists
    const searchAcc = await pool.query(
      `SELECT * FROM accounts WHERE id = $1;`,
      [id]
    );

    if (searchAcc.rows.length != 1) {
      res.status(200).send("ACCOUNT_NOT_FOUND");
      return;
    }

    // check token
    if (searchAcc.rows[0]["email_token"] != token) {
      res.status(200).send("INCORRECT_TOKEN");
      return;
    }

    const grantemail = await pool.query(
      `UPDATE accounts SET email_token = null, verified = true WHERE id = $1`,
      [id]
    );

    res.status(200).send("EMAIL_VERIFIED");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    let id = req.userCred;
    if (!id) {
      return res.status(200).send("UNAUTHORIZED");
    }

    if (rows.length !== 1) {
      return res.status(200).send("ACCOUNT_NOT_FOUND");
    }
    if (!rows[0].profile) {
      return res.status(200).send("NO_PROFILE");
    }

    return res.status(200).send(rows[0].profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const setMyProfile = async (req, res) => {
  try {
    const id = req.userCred;
    const { profile } = req.body;

    if (!profile) {
      return res.status(200).send("MISSING_FIELDS");
    }

    const requiredKeys = ["first_name", "last_name", "gender", "date_of_birth"];

    // check if all required keys are present
    const missingKeys = requiredKeys.filter((key) => !(key in profile));
    if (missingKeys.length) {
      return res.status(200).send("MISSING_FIELDS");
    }

    // updat profile
    const updateacc = await pool.query(
      `UPDATE accounts SET profile = $1 WHERE id = $2`,
      [{ ...profile }, id]
    );

    res.status(200).send("PROFILE_UPDATED");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
