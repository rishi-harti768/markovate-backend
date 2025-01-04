import dotenv from "dotenv";

dotenv.config();

const envSec = process.env.NODE_ENV === "production";

export const setAccessTokenCookie = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: env,
    maxAge: 1000 * 60 * 15, // 15 mins
  });
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: envSec,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};
