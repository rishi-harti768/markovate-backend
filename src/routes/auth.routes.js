import express from "express";
import {
  forgotPasswordAfter,
  forgotPasswordBefore,
  login,
  register,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password-before", forgotPasswordBefore);

router.post("/forgot-password-after", forgotPasswordAfter);

export default router;
