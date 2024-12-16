import {
  decodeToken,
  getAccessToken,
  getRefreshToken,
  verifyToken,
} from "../utils/jwt.utils.js";

export const authenticate = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  const verifyRefresh = verifyToken(refreshToken);

  const verifyAccess = verifyToken(accessToken);

  // check if refresh token is valid
  if (!verifyRefresh) {
    res.status(400).send("DENIED_ACCESS");
    return;
  }

  const decodeRefresh = decodeToken(refreshToken);

  // check if access token is valid or expired
  if (!verifyAccess) {
    const newAccessToken = getAccessToken(decodeRefresh.id);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 15, // 15 mins
    });
  }

  // check if refresh token is expired
  const expDate = new Date(decodeRefresh.exp * 1000);
  const now = new Date();
  const nod = (expDate - now) / 1000 / 60 / 60 / 24;
  if (nod <= 1) {
    const newRefreshToken = getRefreshToken(decodeRefresh.id);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }
  next();
};
