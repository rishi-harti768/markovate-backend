import express from "express";
import {
  authorizeAdmin,
  getAdminDashhboard,
} from "../controllers/admin.controller.js";
import {
  accSetuped,
  adminsOnly,
  authenticate,
} from "../middlewares/authedUser.js";

const router = express.Router();

router.post("/authorize-admin", authorizeAdmin);

router.post(
  "/get-admin-dashboard",
  authenticate,
  accSetuped,
  adminsOnly,
  getAdminDashhboard
);

router.post("/search-accounts", authenticate, accSetuped, adminsOnly);

export default router;
