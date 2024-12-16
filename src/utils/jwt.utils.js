import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.TOKEN_SECRET;

export const getAccessToken = (id) => {
  const token = jwt.sign({ id }, secret, {
    expiresIn: "15m",
  });
  return token;
};

export const getRefreshToken = (id) => {
  const token = jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
  return token;
};

export const verifyToken = (token) => {
  const verify = jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return false;
    } else {
      return true;
    }
  });
  return verify;
};

export const decodeToken = (token) => {
  const decoded = jwt.decode(token, secret, (err, decoded) => {
    if (err) {
      return null;
    } else {
      return decoded;
    }
  });
  return decoded;
};
