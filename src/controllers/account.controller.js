import pool from "../config/db.conf.js";
import { sendEmailVerificationEmail } from "../services/email.service.js";
import crypto from "crypto";
import express from "express";
import cookieParser from "cookie-parser";

export const getDashboard = async (req, res) => {
  try {
    const id = req.userCred;
    if (!id) {
      return res.status(200).send("UNAUTHORIZED");
    }

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

export const emailVerificationBefore = async (req, res) => {
  try {
    const id = req.userCred;

    const { action } = req.body;

    if (!id || !action) {
      return res.status(200).send("MISSING_FIELDS");
    }

    // check if acc exists
    const searchAcc = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [
      id,
    ]);
    if (searchAcc.rows.length != 1) {
      return res.status(200).send("ACCOUNT_NOT_FOUND");
    }

    if (action === "mail") {
      // is acc already verified
      if (searchAcc.rows[0].verified) {
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
      return res.status(200).send({ verified: searchAcc.rows[0].verified });
    } else {
      throw new Error("Invalid action");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const emailVerificationAfter = async (req, res) => {
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

    // check if acc exists
    const { rows } = await pool.query(`SELECT * FROM accounts WHERE id = $1;`, [
      id,
    ]);

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

    if (!id) {
      return res.status(200).send("UNAUTHORIZED");
    }

    const requiredKeys = ["first_name", "last_name", "gender", "date_of_birth"];

    // check if all required keys are present
    const missingKeys = requiredKeys.filter((key) => !(key in profile));
    if (missingKeys.length) {
      return res.status(200).send("MISSING_FIELDS");
    }

    // check if acc exists
    const searchAcc = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [
      id,
    ]);

    if (searchAcc.rows.length != 1) {
      return res.status(200).send("ACCOUNT_NOT_FOUND");
    }

    const updateacc = await pool.query(
      `UPDATE accounts SET profile = $1 WHERE id = $2`,
      [{ ...profile }, id]
    );

    res.status(200).send("PROFILE_UPDATED");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const accountSetup = async (req, res) => {
  try {
    let { id, username, account_type } = req.body;
    if (!id || !username || !account_type) {
      throw new Error("Missing required fields");
    }
    const dbacc = await pool.query(`select * from accounts where id = $1`, [
      id,
    ]);
    if (dbacc.rows.length != 1) {
      res.status(400).send("ACCOUNT_NOT_FOUND");
      return;
    }
    if (account_type == "teacher") {
      account_type = 2;
    } else if (account_type == "student") {
      account_type = 3;
    } else {
      res.status(400).send("INVALID_ACCOUNT_TYPE");
      return;
    }
    try {
      const updateacc = await pool.query(
        `UPDATE accounts SET username = $1, account_type = $2 WHERE id = $3`,
        [username, account_type, id]
      );
    } catch (error) {
      if (error.code === "23505") {
        res.status(400).send("USERNAME_ALREADY_EXISTS");
        return;
      }
      res.status(500).json({ error: error.message });
    }
    res.status(200).send("ACCOUNT_SETUP_DONE");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getJoinOrganisation = async (req, res) => {
  try {
    let { id } = req.body;
    const dbacc = await pool.query(`select * from accounts where id = $1`, [
      id,
    ]);

    // check if acc exists
    if (dbacc.rows.length != 1) {
      res.status(400).send("ACCOUNT_NOT_FOUND");
      return;
    }

    //get org list
    const orgs = await pool.query(`select * from organizations`);
    res.status(200).send(orgs.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const joinOrganisation = async (req, res) => {
  try {
    let { id, org_id } = req.body;

    // check if acc exists
    const dbacc = await pool.query(`select * from accounts where id = $1`, [
      id,
    ]);
    if (dbacc.rows.length != 1) {
      res.status(400).send("ACCOUNT_NOT_FOUND");
      return;
    }

    // check if org exists
    const orgexist = await pool.query(
      `select * from organizations where org_id = $1`,
      [org_id]
    );

    if (orgexist.rows.length != 1) {
      res.status(400).send("ORGANISATION_NOT_FOUND");
      return;
    }

    // try to join existing org
    await pool.query(`UPDATE accounts SET org_id = $1 WHERE id = $2`, [
      org_id,
      id,
    ]);

    res.status(200).send("ACCOUNT_JOINED_ORGANISATION");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrgSendEmail = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      throw new Error("Missing required fields");
    }
    const findorg = await pool.query(
      `select * from organizations where email = $1 or org_name = $2`,
      [email, name]
    );
    if (findorg.rows.length != 0) {
      res.status(400).send("ORGANISATION_OR_EMAIL_ALREADY_EXISTS");
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
