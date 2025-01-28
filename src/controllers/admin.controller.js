import pool from "../config/db.conf.js";
import crypto, { verify } from "crypto";
import validator from "validator";
import bcrypt from "bcrypt";
import { sendOrgRegEmail } from "../services/email.service.js";

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

export const getAdminDashhboard = async (req, res) => {
  try {
    const accQuery = await pool.query(
      `SELECT account_type, verified FROM accounts;`
    );
    // count noumber account verified and not verified
    const accRows = accQuery.rows;
    const accJSON = {
      admin: {
        total: accRows.filter((acc) => acc.account_type == "ADMIN").length,
        verified: accRows.filter(
          (acc) => acc.account_type == "ADMIN" && acc.verified
        ).length,
      },
      client: {
        total: accRows.filter((acc) => acc.account_type == "CLIENT").length,
        verified: accRows.filter(
          (acc) => acc.account_type == "CLIENT" && acc.verified
        ).length,
      },
    };

    const orgRegQuery = await pool.query(
      `select count(*) from organization_reg;`
    );

    return res.status(200).json({
      resCode: "GET_ADMIN_DASHBOARD",
      resData: {
        accounts: accJSON,
        regOrgs: orgRegQuery.rows[0].count,
      },
    });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const searchAcc = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      query = "";
    }

    const num = Math.round(query);
    let accrows = [];
    if (isNaN(num)) {
      const queryAcc = await pool.query(
        `select  id, email, profile ->> 'first_name' as first_name , profile ->> 'last_name' as last_name from accounts where email like '${query}%';`
      );
      accrows = queryAcc.rows;
    } else {
      const queryAcc = await pool.query(
        `select * from accounts where id = ${num};`
      );
      accrows = queryAcc.rows;
    }
    if (accrows.length > 5) {
      accrows.length = 5;
    }
    res
      .status(200)
      .json({ resCode: "SEARCH_ACCOUNT", resData: { accounts: accrows } });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const fetchAccWithId = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(200).json({ resCode: "MISSING_FIELDS" });
    }
    const acc = await pool.query(
      `SELECT id, email, account_type, verified, profile FROM accounts WHERE id = $1;`,
      [id]
    );

    if (acc.rows.length == 0) {
      return res.status(200).json({ resCode: "ACC_NOT_FOUND" });
    }

    res
      .status(200)
      .json({ resCode: "GET_ACCOUNT", resData: { account: acc.rows[0] } });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const getOrgRegList = async (req, res) => {
  try {
    const orgRegQuery = await pool.query(
      `select
        accounts.profile ->> 'first_name' as first_name,
        accounts.profile ->> 'last_name' as last_name,
	      organization_reg.org_name,
        organization_reg.inst_name,
	      organization_reg.status
	      from accounts 
	      join organization_reg 
	      on organization_reg.org_host = accounts.id;`
    );
    res.status(200).json({
      resCode: "GET_ORG_REG_LIST",
      resData: { orgReg: orgRegQuery.rows },
    });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const fetchOrgRegWithName = async (req, res) => {
  try {
    const { org_name } = req.body;

    if (!org_name) {
      return res.status(200).json({ resCode: "MISSING_FIELDS" });
    }

    const orgRegQuery = await pool.query(
      `select
        accounts.profile ->> 'first_name' as first_name,
        accounts.profile ->> 'last_name' as last_name,
	      organization_reg.*
	      from accounts 
	      join organization_reg 
	      on organization_reg.org_host = accounts.id
        where organization_reg.org_name = $1;`,
      [org_name]
    );

    if (orgRegQuery.rows.length == 0) {
      return res.status(200).json({ resCode: "ORG_REG_NOT_FOUND" });
    }

    if (!orgRegQuery.rows[0].mail_token) {
      orgRegQuery.rows[0].btn_send_mail_enabled = true;
    } else {
      orgRegQuery.rows[0].btn_send_mail_enabled = false;
    }

    delete orgRegQuery.rows[0].mail_token;

    res.status(200).json({
      resCode: "GET_ORG_REG",
      resData: { orgReg: orgRegQuery.rows[0] },
    });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const setOrgRegWithName = async (req, res) => {
  try {
    const { org_name } = req.body;

    if (!org_name) {
      return res.status(200).json({ resCode: "MISSING_FIELDS" });
    }
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const sendOrgVerMailAsAdminWithName = async (req, res) => {
  try {
    const { org_name } = req.body;

    if (!org_name) {
      return res.status(200).json({ resCode: "MISSING_FIELDS" });
    }
    const orgRegQuery = await pool.query(
      `select * from organization_reg where org_name = $1;`,
      [org_name]
    );

    if (orgRegQuery.rows.length == 0) {
      return res.status(200).json({ resCode: "ORG_REG_NOT_FOUND" });
    }

    const newMailToken = crypto.randomBytes(16).toString("hex");

    const updateOrgRegQuery = await pool.query(
      `update organization_reg set mail_token = $1 where org_name = $2;`,
      [newMailToken, org_name]
    );

    await sendOrgRegEmail(email, token);
  } catch (error) {
    return res.status(500).json({ resErrMsg: error.message });
  }
};

export const setOrgStatusWithName = async (req, res) => {
  try {
    const { org_name, action } = req.body;

    if (!org_name || !action) {
      res.status(200).json({ resCode: "MISSING_FIELDS" });
    }

    let finalStatus = "";

    if (action == "approve") {
      finalStatus = "APPROVED";
    } else if (action == "verification") {
      finalStatus = "VERIFICATION";
    } else if (action == "reject") {
      finalStatus = "REJECTED";
    }

    const searchOrgRegQuery = await pool.query(
      `select * from organization_reg where org_name = $1;`,
      [org_name]
    );
    if (searchAcc.rows.length == 0) {
      res.status(200).json({ resCode: "ORG_REG_NOT_FOUND" });
    }

    const updateOrgRegQuery = await pool.query(
      `update organization_reg set status = 'APPROVED' where org_name = $1;`,
      [org_name]
    );

    res.status(200).json({
      resCode: "ORG_REG_APPROVED",
    });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};
