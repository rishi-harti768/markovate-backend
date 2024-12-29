import express from "express";
import { authenticate } from "../middlewares/authedUser.js";
import { newOrgReg } from "../controllers/organ.controller.js";

const router = express.Router();

router.post("/new-org-reg", authenticate, newOrgReg);

export default router;
