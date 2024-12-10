import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";

import { DBinit } from "./config/db.conf.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: `*`,
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/account", accountRoutes);

DBinit();

app.listen(process.env.HOST_PORT, () => {
  console.log(`Server running on port ${process.env.HOST_PORT}`);
});
