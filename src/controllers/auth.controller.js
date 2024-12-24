import pool from "../config/db.conf.js";
import bcrypt from "bcrypt";
import { getAccessToken, getRefreshToken } from "../utils/jwt.utils.js";
import crypto from "crypto";
import { sendForgotPasswordEmail } from "../services/email.service.js";
import dotenv from "dotenv";

dotenv.config();
const envSec = process.env.NODE_ENV === "production";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).send("EMPTY_FIELDS");
    }

    //check email format
    if (!isValidEmail(email)) {
      return res.status(200).send("INVALID_EMAIL_FORMAT");
    }

    //check password strength

    if (!isStrongPassword(password)) {
      return res.status(200).send("WEAK_PASSWORD");
    }

    //check if acc exists
    const checkAcc = await pool.query(
      `SELECT id FROM accounts WHERE email = $1`,
      [email]
    );
    if (checkAcc.rows.length > 0) {
      return res.status(200).send("EMAIL_ALREADY_EXISTS");
    }

    // create new acc
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAcc = await pool.query(
      "INSERT INTO accounts (email, password) VALUES ($1, $2) RETURNING id",
      [email, hashedPassword]
    );

    //generate tokens
    const accessToken = getAccessToken(newAcc.rows[0].id);
    const refreshToken = getRefreshToken(newAcc.rows[0].id);

    //set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: envSec,
      maxAge: 1000 * 60 * 15, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: envSec,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    res.status(200).send("AUTHED");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(200).send("EMPTY_FIELDS");
    }

    //check email format
    if (!isValidEmail(email)) {
      return res.status(200).send("INVALID_EMAIL_FORMAT");
    }

    //check password strength
    if (!isStrongPassword(password)) {
      return res.status(200).send("WEAK_PASSWORD");
    }

    //check if acc exists
    const checkAcc = await pool.query(
      `SELECT id, password FROM accounts WHERE email = $1`,
      [email]
    );

    if (checkAcc.rows.length != 1) {
      return res.status(200).send("EMAIL_NOT_FOUND");
    }

    //check password
    const isMatch = await bcrypt.compare(password, checkAcc.rows[0].password);
    if (!isMatch) {
      return res.status(200).send("INCORRECT_PASSWORD");
    }

    //generate tokens
    const accessToken = getAccessToken(checkAcc.rows[0].id);
    const refreshToken = getRefreshToken(checkAcc.rows[0].id);

    //set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: envSec,
      maxAge: 1000 * 60 * 15, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: envSec,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    res.status(200).send("AUTHED");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPasswordBefore = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(200).send("EMPTY_FIELDS");
      return;
    }
    //check email format
    if (!isValidEmail(email)) {
      res.status(200).send("INVALID_EMAIL_FORMAT");
      return;
    }

    // check if acc exists
    const searchAcc = await pool.query(
      `SELECT * FROM accounts WHERE email = $1`,
      [email]
    );

    if (searchAcc.rows.length != 1) {
      res.status(200).send("EMAIL_NOT_FOUND");
      return;
    }

    const token = crypto.randomBytes(16).toString("hex");
    const grantemail = await pool.query(
      `UPDATE accounts SET password_token = $1 WHERE email = $2`,
      [token, email]
    );
    await sendForgotPasswordEmail(email, token);
    res.status(200).send("MAIL_SENT");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPasswordAfter = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    if (!email || !password || !token) {
      res.status(200).send("EMPTY_FIELDS");
      return;
    }

    // check email format
    if (!isValidEmail(email)) {
      res.status(200).send("INVALID_EMAIL_FORMAT");
      return;
    }

    // password strength
    if (!isStrongPassword(password)) {
      res.status(200).send("WEAK_PASSWORD");
      return;
    }

    // check if acc exists
    const searchAcc = await pool.query(
      `SELECT password_token FROM accounts WHERE email = $1`,
      [email]
    );

    if (searchAcc.rows.length != 1) {
      res.status(200).send("EMAIL_NOT_FOUND");
      return;
    }

    // check token
    if (searchAcc.rows[0]["password_token"] != token) {
      res.status(200).send("INVALID_TOKEN");
      return;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update password
    const grantpassword = await pool.query(
      `UPDATE accounts SET password = $1, password_token = null WHERE email = $2`,
      [hashedPassword, email]
    );
    res.status(200).send("PASSWORD_CHANGED");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
}
