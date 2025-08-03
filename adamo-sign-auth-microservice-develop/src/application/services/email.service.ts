import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { RabbitMQService } from "./rabbitmq.service";
import { HttpError } from "../../utils/httpError";

dotenv.config();

export function registerHandlebarsHelpers(
  t: (key: string, vars?: Record<string, any>) => string
) {
  Handlebars.registerHelper("t", function (key: string, options: any) {
    const vars = options.hash || {};
    return new Handlebars.SafeString(t(key, vars));
  });
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  resend: boolean = false,
  t: (key: string, vars?: Record<string, any>) => string
): Promise<void> {
  registerHandlebarsHelpers(t);

  const templatePath = path.resolve(
    __dirname,
    "templates",
    !resend ? "resetPassword.template.html" : "resendOtp.template.html"
  );

  try {
    var source = fs.readFileSync(templatePath, "utf8");
    var template = Handlebars.compile(source);

    var data = {
      security_code: otp,
    };
    var result = template(data);
    console.log("OTP email template rendered successfully");

    console.log("Publishing OTP email to RabbitMQ for email:", email);
    // Publish the email to RabbitMQ
    await RabbitMQService.publishTransactionalEmailQueue(
      `${t("email.team_adamo_name").toUpperCase()} <${
        process.env.MAIL_SENDER
      }>`, // from
      email, // to
      t("email.subject_send_otp").toUpperCase(), // subject
      t("email.subject_send_otp").toUpperCase(), // text
      result // content
    );
    console.log("OTP email published successfully for email:", email);
  } catch (error) {
    throw new HttpError(400, t("custom.failed_to_send_otp_email"));
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  t: (key: string, vars?: Record<string, any>) => string
): Promise<void> {
  registerHandlebarsHelpers(t);

  const templatePath = path.join(
    __dirname,
    "templates",
    "welcome.template.html"
  );

  try {
    var source = fs.readFileSync(templatePath, "utf8");
    var template = Handlebars.compile(source);

    var data = {
      FIRST_NAME: name,
    };
    var result = template(data);

    await RabbitMQService.publishTransactionalEmailQueue(
      `${t("email.team_adamo_name").toUpperCase()} <${
        process.env.MAIL_SENDER
      }>`, // from
      email, // to
      t("email.subject_welcome_user").toUpperCase(), // subject
      t("email.subject_welcome_user").toUpperCase(), // text
      result // content
    );
  } catch (error) {
    throw new HttpError(400, t("custom.failed_to_send_welcome_email"));
  }
}

export async function sendPasswordUpdatedEmail(
  email: string,
  name: string,
  t: (key: string, vars?: Record<string, any>) => string
): Promise<void> {
  registerHandlebarsHelpers(t);

  const templatePath = path.join(
    __dirname,
    "templates",
    "passwordUpdated.template.html"
  );

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
      FIRST_NAME: name,
    };
    var result = template(data);
    console.log("Password updated email template rendered successfully");

    await RabbitMQService.publishTransactionalEmailQueue(
      `${t("email.team_adamo_name").toUpperCase()} <${
        process.env.MAIL_SENDER
      }>`, // from
      email, // to
      t("email.subject_password_update").toUpperCase(), // subject
      t("email.subject_password_update").toUpperCase(), // text
      result // content
    );
    console.log(
      "Password updated email published successfully for email:",
      email
    );
  } catch (error) {
    console.log("Error rendering password updated email template:", error);
    throw new HttpError(400, t("custom.failed_to_send_password_updated_email"));
  }
}
