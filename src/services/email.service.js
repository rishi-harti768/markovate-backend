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

export const sendEmailVerificationEmail = async (id, email, token) => {
  var mailOptions = {
    from: hostEmail,
    to: email,
    subject: "Email Verification",
    html: `Click <a href="${client}/dashboard/get-verified/${id}/${token}">here</a> to get verified`,
  };
  await transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info.response);
    }
  });
};
