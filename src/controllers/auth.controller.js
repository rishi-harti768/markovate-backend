import pool from "../config/db.conf.js";
import bcrypt from "bcrypt";
import { getAccessToken, getRefreshToken } from "../utils/jwt.utils.js";
import crypto from "crypto";
import { sendForgotPasswordEmail } from "../services/email.service.js";
import dotenv from "dotenv";
import validator from "validator";

dotenv.config();

const envSec = process.env.NODE_ENV === "production";

export const register = async (req, res) => {
  try {
    let { email, password } = req.body;

    // check for empty fields

    let errjson = {};

    if (!email || (email && email.trim()) == "") {
      errjson.email = "Email is Required";
    }

    if (!password || (password && password.trim() == "")) {
      errjson.password = "Password is Required";
    }

    if (Object.keys(errjson).length > 0) {
      return res.status(200).json({
        resCode: "INPUT_ERROR",
        resData: { error: errjson },
      });
    }

    // sanitize inputs
    email = email.trim().toLowerCase();
    password = password.trim();

    errjson = {};
    //check email format
    if (!validator.isEmail(email)) {
      errjson.email = "Invalid Email Format";
    }

    //check password strength
    if (!isStrongPassword(password)) {
      errjson.password = "Strong Password Required";
    }

    if (Object.keys(errjson).length > 0) {
      return res.status(200).json({
        resCode: "INPUT_ERROR",
        resData: { error: errjson },
      });
    }

    //check if acc exists
    const checkAcc = await pool.query(
      `SELECT id FROM accounts WHERE email = $1`,
      [email]
    );
    if (checkAcc.rows.length > 0) {
      return res.status(200).json({
        resCode: "AUTH_ACC_ALREADY_EXISTS",
        resData: { error: { email: "Account already exists" } },
      });
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

    res
      .status(200)
      .json({ resCode: "AUTH_REGISTER_SUCCESS", resRoute: "/dashboard" });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let errjson = {};

    if (!email || (email && email.trim()) == "") {
      errjson.email = "Email is Required";
    }

    if (!password || (password && password.trim() == "")) {
      errjson.password = "Password is Required";
    }

    if (Object.keys(errjson).length > 0) {
      return res.status(200).json({
        resCode: "INPUT_ERROR",
        resData: { error: errjson },
      });
    }

    errjson = {};
    //check email format
    if (!validator.isEmail(email)) {
      errjson.email = "Invalid Email Format";
    }

    //check password strength
    if (!isStrongPassword(password)) {
      errjson.password = "Strong Password Required";
    }

    if (Object.keys(errjson).length > 0) {
      return res.status(200).json({
        resCode: "INPUT_ERROR",
        resData: { error: errjson },
      });
    }

    //check if acc exists
    const checkAcc = await pool.query(
      `SELECT id, password FROM accounts WHERE email = $1`,
      [email]
    );

    if (checkAcc.rows.length != 1) {
      // email not found
      return res.status(200).json({
        resCode: "AUTH_FAILED",
        resData: { error: { general: "Invalid Email or Password" } },
      });
    }

    //check password
    const isMatch = await bcrypt.compare(password, checkAcc.rows[0].password);
    if (!isMatch) {
      // incorrect password
      return res.status(200).json({
        resCode: "AUTH_FAILED",
        resData: { error: { general: "Invalid Email or Password" } },
      });
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

    res
      .status(200)
      .json({ resCode: "AUTH_LOGIN_SUCCESS", resRoute: "/dashboard" });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const forgotPass = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(200).json({ resCode: "EMPTY_FIELDS" });
    }

    //check email format
    if (!isValidEmail(email)) {
      return res.status(200).json({ resCode: "INVALID_EMAIL_FORMAT" });
    }

    // check if acc exists
    const searchAcc = await pool.query(
      `SELECT * FROM accounts WHERE email = $1`,
      [email]
    );

    if (searchAcc.rows.length != 1) {
      return res.status(200).json({ resCode: "AUTH_FP_EMAIL_NOT_FOUND" });
    }

    const token = crypto.randomBytes(16).toString("hex");
    const grantemail = await pool.query(
      `UPDATE accounts SET password_token = $1 WHERE email = $2`,
      [token, email]
    );
    await sendForgotPasswordEmail(email, token);
    res.status(200).json({ resCode: "AUTH_FP_EMAIL_SENT" });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const forgotPassChangePass = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    if (!email || !password || !token) {
      return res.status(200).json({ resCode: "EMPTY_FIELDS" });
    }

    // check email format
    if (!isValidEmail(email)) {
      return res.status(200).json({ resCode: "INVALID_EMAIL_FORMAT" });
    }

    // password strength
    if (!isStrongPassword(password)) {
      return res.status(200).json({ resCode: "WEAK_PASSWORD" });
    }

    // check if acc exists
    const searchAcc = await pool.query(
      `SELECT password_token FROM accounts WHERE email = $1`,
      [email]
    );

    if (searchAcc.rows.length != 1) {
      return res.status(200).json({ resCode: "AUTH_FP_EMAIL_NOT_FOUND" });
    }

    // check token
    if (searchAcc.rows[0]["password_token"] != token) {
      return res.status(200).json({ resCode: "AUTH_FP_INVALID_TOKEN" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update password
    const grantpassword = await pool.query(
      `UPDATE accounts SET password = $1, password_token = null WHERE email = $2`,
      [hashedPassword, email]
    );

    res
      .status(200)
      .json({ resCode: "AUTH_FP_CHANGED", resRoute: "/auth/login" });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
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
