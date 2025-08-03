import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { User } from "../../domain/models/user.entity";

dotenv.config();
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  // secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // tls: {
  //   rejectUnauthorized: false,
  // },
});

export function registerHandlebarsHelpers(
  t: (key: string, vars?: Record<string, any>) => string
) {
  Handlebars.registerHelper("t", function (key: string, options: any) {
    const vars = options.hash || {};
    return new Handlebars.SafeString(t(key, vars));
  });
}

export async function sendCompletedDocumentEmail(
  emailParticipant: string,
  nameParticipant: string,
  signers: string[],
  document_link: string,
  document_name: string,
  t: (key: string, vars?: Record<string, any>) => string
): Promise<void> {
  console.log(
    "[sendCompletedDocumentEmail] Sending completed document email..."
  );
  registerHandlebarsHelpers(t);

  const templatePath = path.join(
    __dirname,
    "./templates",
    "completed_doc.template.html"
  );

  console.log("[sendCompletedDocumentEmail] Template path:", templatePath);
  console.log("[sendCompletedDocumentEmail] Email:", emailParticipant);
  console.log("[sendCompletedDocumentEmail] Signers:", signers);
  try {
    var source = fs.readFileSync(templatePath, "utf8");
    var template = Handlebars.compile(source);

    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

    var data = {
      guest_name: nameParticipant || "",
      document_name: document_name,
      document_link: document_link,
      signed_users_html: "",
    };
    var result = template(data);

    console.log(
      "[sendCompletedDocumentEmail] Email content generated:",
      result
    );
    const mailOptions = {
      from: `${t("email.team_adamo_name").toUpperCase()} <${
        process.env.MAIL_SENDER
      }>`,
      to: emailParticipant,
      subject: t("email.completed_document_signer").toUpperCase(),
      text: t("email.completed_document_signer").toUpperCase(),
      html: result,
    };

    console.log("[sendCompletedDocumentEmail] Mail options:", mailOptions);
    const response = await transporter.sendMail(mailOptions);
    console.log("Email send response:", response);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export async function sendGeneralEmail(
  from: string,
  to: string,
  subject: string,
  text: string,
  content: any
): Promise<void> {
  try {
    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: content,
    };

    const response = await transporter.sendMail(mailOptions);
    console.log("Email send response:", response);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
