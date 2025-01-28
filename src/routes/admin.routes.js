import express from "express";
import {
  authorizeAdmin,
  fetchAccWithId,
  fetchOrgRegWithName,
  getAdminDashhboard,
  getOrgRegList,
  searchAcc,
  sendOrgVerMailAsAdminWithName,
  setOrgStatusWithName,
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

router.post("/search-account", searchAcc);

router.post("/fetch-account-with-id", fetchAccWithId);

router.post("/get-org-reg-list", getOrgRegList);

router.post("/fetch-org-reg-with-name", fetchOrgRegWithName);

router.post("/send-org-ver-mail-with-name", sendOrgVerMailAsAdminWithName);

router.post("/set-org-status-with-name", setOrgStatusWithName);

export default router;
