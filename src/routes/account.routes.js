import express from "express";
import {
  getDashboard,
  getMyProfile,
  regNewOrg,
  requestOrgJoin,
  setMyProfile,
  verifyEmailCheck,
  verifyEmailSendEmail,
} from "../controllers/account.controller.js";
import { authenticate, accSetuped } from "../middlewares/authedUser.js";

const router = express.Router();

router.post("/get-dashboard", authenticate, accSetuped, getDashboard);

router.post(
  "/verify-email/send",
  authenticate,
  accSetuped,
  verifyEmailSendEmail
);

router.post("/verify-email/check", verifyEmailCheck);

router.post("/setup-my-profile", authenticate, accSetuped, setMyProfile);

router.post("/get-my-profile", authenticate, accSetuped, getMyProfile);

router.post("/set-my-profile", authenticate, accSetuped, setMyProfile);

router.post("/reg-new-org", authenticate, accSetuped, regNewOrg);

router.post("/request-org-join", authenticate, accSetuped, requestOrgJoin);

export default router;
