import express from "express";
import {
  accountSetup,
  createOrgSendEmail,
  emailVerificationAfter,
  emailVerificationBefore,
  fetchAccount,
  getJoinOrganisation,
  joinOrganisation,
} from "../controllers/account.controller.js";
import { authenticate } from "../middlewares/authedUser.js";

const router = express.Router();

router.post("/fetch-account", fetchAccount);

router.post("/email-verify-before", emailVerificationBefore);

router.post("/email-verify-after", emailVerificationAfter);

router.post("/setup-account", accountSetup);

router.post("/get-join-org", getJoinOrganisation);

router.post("/join-org", joinOrganisation);

router.post("/create-org", createOrgSendEmail);

export default router;
