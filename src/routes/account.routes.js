import express from "express";
import {
  accountSetup,
  createOrgSendEmail,
  emailVerificationAfter,
  emailVerificationBefore,
  getDashboard,
  getJoinOrganisation,
  getMyProfile,
  joinOrganisation,
  setMyProfile,
} from "../controllers/account.controller.js";
import { authenticate } from "../middlewares/authedUser.js";

const router = express.Router();

router.post("/get-dashboard", authenticate, getDashboard);

router.post("/email-verify-before", authenticate, emailVerificationBefore);

router.post("/email-verify-after", emailVerificationAfter);

router.post("/get-my-profile", authenticate, getMyProfile);

router.post("/set-my-profile", authenticate, setMyProfile);

router.post("/setup-account", accountSetup);

router.post("/get-join-org", authenticate, getJoinOrganisation);

router.post("/join-org", authenticate, joinOrganisation);

router.post("/create-org", createOrgSendEmail);

export default router;
