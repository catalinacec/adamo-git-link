import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // tls: {
  //   rejectUnauthorized: false,
  // },
});

export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<void> {
  const templatePath = path.join(
    __dirname,
    "templates",
    "welcome.template.html"
  );

  try {
    let htmlContent = fs.readFileSync(templatePath, "utf8");
    htmlContent = htmlContent.replace(/{{FIRST_NAME}}/g, firstName);

    const mailOptions = {
      from: "Adamo <alvarochico.sp@gmail.com>",
      to: email,
      subject: "Welcome to Our Platform!",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
}
