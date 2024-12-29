import express from "express";
import {
  forgotPass,
  forgotPassChangePass,
  login,
  register,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-pass", forgotPass);

router.post("/forgot-pass/change-pass", forgotPassChangePass);

export default router;
