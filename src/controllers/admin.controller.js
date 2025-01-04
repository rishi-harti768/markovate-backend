import pool from "../config/db.conf.js";
import crypto from "crypto";
import validator from "validator";
import bcrypt from "bcrypt";

export const authorizeAdmin = async (req, res) => {
  try {
    const { email, password, key, token1, token2 } = req.body;

    if (!email || !password || !key || !token1 || !token2) {
      return res.status(200).send("cannot POST /admin/be-super-user");
    }

    if (!key == "myKey" && !token1 == "myToken1" && !token2 == "myToken2") {
      return res.status(200).send("cannot POST /admin/be-super-user");
    }

    const searchAcc = await pool.query(
      `SELECT id, password FROM accounts WHERE email = $1 AND verified = true`,
      [email]
    );

    if (searchAcc.rows.length != 1) {
      return res.status(200).send("cannot POST /admin/be-super-user");
    }

    const isMatch = await bcrypt.compare(password, searchAcc.rows[0].password);

    if (!isMatch) {
      return res.status(200).send("cannot POST /admin/be-super-user");
    }

    const grantSuperUser = await pool.query(
      `UPDATE accounts SET account_type = 'ADMIN' WHERE email = $1`,
      [email]
    );

    res.status(200).send("ACCESS_GRANTED");
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};
