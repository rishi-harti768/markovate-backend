import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";

import { DBinit } from "./config/db.conf.js";
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authedUser.js";

dotenv.config();

const limiter = rateLimit({
  windowMs: 1000 * 60 * 60, // 1 hour
  max: 6000, // 100 RPM
  message: "SUSPENDED_DUE_TO_RATE_LIMIT",
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

app.use(helmet());
app.disable("x-powered-by");
app.use(
  cors({
    origin: `${process.env.CLIENT_URL}`,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this line to parse URL-encoded cookies
app.use(limiter);

app.get("/", (req, res) => res.send("server is running"));

app.use("/auth", authRoutes);
app.use("/account", accountRoutes);

app.post("/test", authenticate, async (req, res) => {
  res.status(200).send(req.userCred);
});

DBinit();

app.listen(process.env.HOST_PORT, () => {
  console.log(`Server running on port ${process.env.HOST_PORT}`);
});
