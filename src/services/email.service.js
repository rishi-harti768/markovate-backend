import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const client = process.env.CLIENT_URL;
const hostEmail = process.env.HOST_EMAIL_ADDRESS;
const password = process.env.HOST_EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: hostEmail,
    pass: password,
  },
});

export const sendForgotPasswordEmail = async (email, token) => {
  var mailOptions = {
    from: hostEmail,
    to: email,
    subject: "Password Reset",
    html: `Click <a href="${client}/auth/forgot-pass/${email}/${token}">here</a> to reset your password`,
  };
  await transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info.response);
    }
  });
};

export const sendEmailVerificationEmail = async (email, token) => {
  var mailOptions = {
    from: hostEmail,
    to: email,
    subject: "Password Reset",
    html: `Click <a href="https://www.google.com/">here</a> to get verified`,
  };
  await transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info.response);
    }
  });
};
