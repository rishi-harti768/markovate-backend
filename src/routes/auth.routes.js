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

router.post("/forgot-pass-before", forgotPasswordBefore);

router.post("/forgot-pass-after", forgotPasswordAfter);

export default router;
