import express from "express";
import {
  emailVerificationAfter,
  emailVerificationBefore,
  fetchuser,
} from "../controllers/account.controller.js";

const router = express.Router();

router.post("/fetchuser", fetchuser);

router.post("/email-verify-before", emailVerificationBefore);

router.post("/email-verify-after", emailVerificationAfter);

export default router;
