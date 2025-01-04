import express from "express";
import { authorizeAdmin } from "../controllers/admin.controller.js";
import {
  accSetuped,
  adminsOnly,
  authenticate,
} from "../middlewares/authedUser.js";
import { getDashboard } from "../controllers/account.controller.js";
import io from "../socket.js";

const router = express.Router();

router.post("/authorize-admin", authorizeAdmin);

router.post("/search-accounts", authenticate, accSetuped, adminsOnly);

export default router;
