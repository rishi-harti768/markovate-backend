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
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  const verifyRefresh = verifyToken(refreshToken);

  const verifyAccess = verifyToken(accessToken);

  // check if refresh token is valid
  if (!verifyRefresh) {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.status(400).send("DENIED_ACCESS");
    return;
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

  // check if refresh token is expired
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

  // check if acc exist

  const acc = await pool.query(`SELECT * FROM accounts WHERE id = $1`, [
    decodeRefresh.id,
  ]);

  if (acc.rows.length !== 1) {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return res.status(200).send("FORCE_AUTH_OUT");
  }

  req.userCred = decodeRefresh.id;
  next();
};
