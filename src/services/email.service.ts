import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

console.log("SMTP HOST:", process.env.ETHEREAL_HOST);
console.log("SMTP PORT:", process.env.ETHEREAL_PORT);
console.log("SMTP USER:", process.env.ETHEREAL_USER);

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST,
  port: Number(process.env.ETHEREAL_PORT),
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASSWORD,
  },
});

export async function sendEmail(
  recipient: string,
  subject: string,
  body: string
) {
  const info = await transporter.sendMail({
    from: process.env.ETHEREAL_USER,
    to: recipient,
    subject,
    text: body,
  });

  console.log("Email sent:", info.messageId);
  console.log(
    "Preview URL:",
    nodemailer.getTestMessageUrl(info)
  );

  return info;
}