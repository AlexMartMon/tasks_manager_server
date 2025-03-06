import dotenv from "dotenv";

dotenv.config();
const nodemailer = require("nodemailer");
const config = {
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
};

export const transporter = nodemailer.createTransport(config);
