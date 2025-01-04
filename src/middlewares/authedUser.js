import pool from "../config/db.conf.js";
import {
  decodeToken,
  getAccessToken,
  getRefreshToken,
  verifyToken,
} from "../utils/jwt.utils.js";
import dotenv from "dotenv";

dotenv.config();
const envSec = process.env.NODE_ENV === "production";

export const authenticate = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;

    const verifyRefresh = verifyToken(refreshToken);

    const verifyAccess = verifyToken(accessToken);

    // check if refresh token is valid
    if (!verifyRefresh) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      return res
        .status(200)
        .json({ resCode: "AUTH_INVALID_TOKEN", resRoute: "/auth" });
    }

    const decodeRefresh = decodeToken(refreshToken);

    // check if access token is valid or expired
    if (!verifyAccess) {
      const newAccessToken = getAccessToken(decodeRefresh.id);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: envSec,
        maxAge: 1000 * 60 * 15, // 15 mins
      });
    }

    // check if refresh token is about to expire
    const expDate = new Date(decodeRefresh.exp * 1000);
    const now = new Date();
    const nod = (expDate - now) / 1000 / 60 / 60 / 24;
    if (nod <= 1) {
      const newRefreshToken = getRefreshToken(decodeRefresh.id);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: envSec,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    // check if account exists
    const acc = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [
      decodeRefresh.id,
    ]);

    if (acc.rows.length !== 1) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      return res
        .status(200)
        .json({ resCode: "UNKNOWN_ACCOUNT", resRoute: "/auth" });
    }

    req.userCred = decodeRefresh.id;
    req.userAcc = acc.rows[0];

    next();
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const accSetuped = async (req, res, next) => {
  try {
    const acc = req.userAcc;

    if (req.originalUrl == "/account/verify-email/send") {
      return next();
    }

    // check if account is verified
    if (!acc.verified) {
      return res.status(200).json({
        resCode: "ACCOUNT_NOT_VERIFIED",
        resRoute: "/dashboard/get-verified",
      });
    }

    if (
      req.originalUrl == "/account/set-my-profile" ||
      req.originalUrl == "/account/get-my-profile"
    ) {
      return next();
    }

    // check if profile is setuped
    if (!acc.profile) {
      return res.status(200).json({
        resCode: "NO_PROFILE",
        resRoute: "/dashboard/my-profile",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const adminsOnly = async (req, res, next) => {
  try {
    const acc = req.userAcc;
    if (acc.account_type !== "ADMIN") {
      return res
        .status(200)
        .json({ resCode: "NOT_A_PLACE_FOR_YOU", resRoute: "/dashboard" });
    }
    next();
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};
