import pool from "../config/db.conf.js";
import { sendEmailVerificationEmail } from "../services/email.service.js";
import crypto from "crypto";
import validator from "validator";

export const getDashboard = async (req, res) => {
  try {
    const acc = req.userAcc;

    const orgs = await pool.query(
      `SELECT org_name, inst_name, status FROM organization_reg WHERE org_host = $1;`,
      [acc.id]
    );

    return res.status(200).json({
      resCode: "GET_DASHBOARD",
      resData: {
        orgs: {
          raw_orgs: orgs.rows,
        },
        hasSuperControls: acc.account_type === "ADMIN",
      },
    });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const verifyEmailSendEmail = async (req, res) => {
  try {
    const id = req.userCred;
    const acc = req.userAcc;

    const { action } = req.body;

    if (!action) {
      return res.status(200).json({
        resCode: "MISSING_FIELDS",
        resServerErrDialog: "Server Error: Action should be specified",
      });
    }

    if (action === "mail") {
      // is acc already verified
      if (acc.verified) {
        return res.status(200).json({
          resCode: "AV_ACC_ALREADY_VERIFIED",
          resRoute: "/dashboard",
        });
      }

      // send verification email
      const token = crypto.randomBytes(16).toString("hex");
      const grantemail = await pool.query(
        `UPDATE accounts SET email_token = $1 WHERE id = $2 RETURNING email`,
        [token, id]
      );
      sendEmailVerificationEmail(id, grantemail.rows[0].email, token);

      return res.status(200).json({
        resCode: "AV_ACC_VERIFICATION_EMAIL_SENT",
        resData: { mailSent: true },
      });
    } else if (action === "status") {
      // is acc already verified
      if (acc.verified) {
        return res.status(200).json({
          resCode: "AV_ACC_ALREADY_VERIFIED",
          resRoute: "/dashboard",
        });
      }

      return res.status(200).json({
        resCode: "AV_ACC_VERIFICATION_REQUIRED",
      });
    } else {
      res.status(200).json({
        resCode: "AV_INVALID_ACTION",
        resServerErrDialog: "Server Error: Invalid Action",
      });
    }
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const verifyEmailCheck = async (req, res) => {
  try {
    const { id, token } = req.body;
    if (!id || !token) {
      return res.status(200).json({
        resCode: "MISSING_FIELDS",
        resServerErrDialog: "Server Error: Arguments expected",
      });
    }

    // check if acc exists
    const searchAcc = await pool.query(
      `SELECT * FROM accounts WHERE id = $1;`,
      [id]
    );

    if (searchAcc.rows.length != 1) {
      return res
        .status(200)
        .json({ resCode: "UNKNOWN_ACCOUNT", resRoute: "/dashboard" });
    }

    // check token
    if (searchAcc.rows[0]["email_token"] != token) {
      return res
        .status(200)
        .json({ resCode: "AV_INCORRECT_TOKEN", resRoute: "/dashboard" });
    }

    const grantemail = await pool.query(
      `UPDATE accounts SET email_token = null, verified = true WHERE id = $1`,
      [id]
    );

    res
      .status(200)
      .json({ resCode: "AV_ACC_VERIFIED", resData: { accVerified: true } });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const acc = req.userAcc;
    let resData = {};
    resData.profile = acc.profile;
    if (!acc.profile) {
      resData.isProfileSetup = true;
    } else {
      resData.isProfileSetup = false;
    }
    return res
      .status(200)
      .json({ resCode: "GET_MY_PROFILE", resData: resData });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const setMyProfile = async (req, res) => {
  try {
    const id = req.userCred;
    const { profile } = req.body;

    const requiredFields = [
      "first_name",
      "last_name",
      "gender",
      "date_of_birth",
    ];
    if (!profile) {
      return res.status(200).json({
        resCode: "MISSING_FIELDS",
        resData: {
          resData: { missingFields: requiredFields, accUpdated: false },
        },
      });
    }

    // check if all required keys are present
    const missingKeys = requiredFields.filter(
      (key) => !(key in profile) || profile[key] === ""
    );
    if (missingKeys.length) {
      return res.status(200).json({
        resCode: "MISSING_FIELDS",
        resData: { missingFields: missingKeys, accUpdated: false },
      });
    }

    // update profile
    const updateacc = await pool.query(
      `UPDATE accounts SET profile = $1 WHERE id = $2`,
      [{ ...profile }, id]
    );

    res
      .status(200)
      .json({ resCode: "SET_MY_PROFILE", resData: { accUpdated: true } });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const regNewOrg = async (req, res) => {
  try {
    const id = req.userCred;
    let { org_name, inst_name, website, email, phone } = req.body;

    const requiredFields = [
      "org_name",
      "inst_name",
      "website",
      "email",
      "phone",
    ];

    // check for empty fields
    const missingKeys = requiredFields.filter(
      (key) => !(key in req.body) || req.body[key] === ""
    );

    if (missingKeys.length != 0) {
      return res.status(200).json({
        resCode: "MISSING_FIELDS",
        resData: { missingFields: missingKeys },
      });
    }

    // sanitize inputs
    org_name = org_name.trim();
    inst_name = inst_name.trim();
    website = website.trim();
    email = email.trim();
    phone = phone.trim();

    let invaildFormats = [];

    // check valid website url
    if (!validator.isURL(website)) {
      invaildFormats.push("website");
    }

    // check email format
    if (!validator.isEmail(email)) {
      invaildFormats.push("email");
    }

    // check valid phone number
    if (!validator.isMobilePhone(phone)) {
      invaildFormats.push("phone");
    }

    if (validator.isUppercase(org_name) || validator.contains(org_name, " ")) {
      invaildFormats.push("org_name");
    }

    if (invaildFormats.length != 0) {
      return res.status(200).json({
        resCode: "INVALID_FIELDS",
        resData: { invaildFields: invaildFormats },
      });
    }

    //check if org exist in table organizations
    const searchOrg = await pool.query(
      `SELECT * FROM organizations WHERE org_name = $1 OR inst_name = $2 OR email = $3;`,
      [org_name, inst_name, email]
    );

    if (searchOrg.rows.length > 0) {
      return res.status(200).json({
        resCode: "ORG_REG_FAILED",
        resData: { errTxt: "Organization already exists" },
      });
    }

    // insert new org in table organization_reg
    try {
      const insertOrg = await pool.query(
        `INSERT INTO organization_reg (org_name, inst_name, org_host, website, email, phone) VALUES ($1, $2, $3, $4, $5, $6);`,
        [org_name, inst_name, id, website, email, phone]
      );
    } catch (error) {
      if (error.code == "23505")
        return res.status(200).json({
          resCode: "ORG_REG_FAILED",
          resData: { errTxt: "Organization already exists" },
        });
    }

    res.status(200).json({ resCode: "QUEUED_ORG_REG", resRoute: "/dashboard" });
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};

export const requestOrgJoin = async (req, res) => {
  try {
    const id = req.userCred;
    const { org_id } = req.body;
  } catch (error) {
    res.status(500).json({ resErrMsg: error.message });
  }
};
