import express from "express";
import {
  getDashboard,
  getMyProfile,
  setMyProfile,
  verifyEmailCheck,
  verifyEmailSendEmail,
} from "../controllers/account.controller.js";
import { authenticate } from "../middlewares/authedUser.js";

const router = express.Router();

router.post("/get-dashboard", authenticate, getDashboard);

router.post("/verify-email/send", authenticate, verifyEmailSendEmail);

router.post("/verify-email/check", verifyEmailCheck);

router.post("/get-my-profile", authenticate, getMyProfile);

router.post("/set-my-profile", authenticate, setMyProfile);

/* router.post("/setup-account", accountSetup);

router.post("/get-join-org", authenticate, getJoinOrganisation);

router.post("/join-org", authenticate, joinOrganisation);

router.post("/create-org", createOrgSendEmail); */

export default router;
