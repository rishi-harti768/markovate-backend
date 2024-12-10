import pool from "../config/db.conf.js";
import bcrypt from "bcrypt";
import { getAccessToken, getRefreshToken } from "../utils/jwt.utils.js";
import crypto from "crypto";
import { sendForgotPasswordEmail } from "../services/email.service.js";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    //check email format

    //check password strength

    //check if acc exists
    const checkAcc = await pool.query(
      `SELECT id FROM accounts WHERE email = $1`,
      [email]
    );
    if (checkAcc.rows.length > 0) {
      res.status(400).send("EMAIL_ALREADY_EXISTS");
      return;
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
      secure: true,
      sameSite: "strict",
      maxAge: 900000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 2592000000, // 30 days
    });

    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //check email format

    //check password strength

    //check if acc exists
    const checkAcc = await pool.query(
      `SELECT id, password FROM accounts WHERE email = $1`,
      [email]
    );
    if (checkAcc.rows.length != 1) {
      res.status(400).send("EMAIL_NOT_FOUND");
      return;
    }

    //check password
    const isMatch = await bcrypt.compare(password, checkAcc.rows[0].password);
    if (!isMatch) {
      res.status(400).send("INCORRECT_PASSWORD");
      return;
    }

    //generate tokens

    const accessToken = getAccessToken(checkAcc.rows[0].id);
    const refreshToken = getRefreshToken(checkAcc.rows[0].id);

    //set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 900000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 2592000000, // 30 days
    });

    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPasswordBefore = async (req, res) => {
  try {
    const { email } = req.body;
    // check if acc exists
    const searchAcc = await pool.query(
      `SELECT * FROM accounts WHERE email = $1`,
      [email]
    );
    if (searchAcc.rows.length != 1) {
      res.status(400).send("EMAIL_NOT_FOUND");
      return;
    }
    const token = crypto.randomBytes(16).toString("hex");
    const grantemail = await pool.query(
      `UPDATE accounts SET password_token = $1 WHERE email = $2`,
      [token, email]
    );
    // await sendForgotPasswordEmail(email, token);
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPasswordAfter = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    // check if acc exists
    const searchAcc = await pool.query(
      `SELECT password_token FROM accounts WHERE email = $1`,
      [email]
    );

    if (searchAcc.rows.length != 1) {
      res.status(400).send("EMAIL_NOT_FOUND");
      return;
    }
    // check token
    if (searchAcc.rows[0]["password_token"] != token) {
      res.status(400).send("INCORRECT_TOKEN");
      return;
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update password
    const grantpassword = await pool.query(
      `UPDATE accounts SET password = $1, password_token = null WHERE email = $2`,
      [hashedPassword, email]
    );
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
