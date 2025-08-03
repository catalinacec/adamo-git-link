import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { HttpError } from "../../utils/httpError";
import Handlebars from "handlebars";
import { RabbitMQService } from "./rabbitmq.service";
import { getI18n } from "../../i18n/i18n";

dotenv.config();

interface RegistrationEmailData {
  to: string;
  documentId: string;
  contractId: string;
  transactionId: string;
  network: string;
  registeredAt: Date;
  hash: string;
}

export function registerHandlebarsHelpers(
  t: (key: string, vars?: Record<string, any>) => string
) {
  Handlebars.registerHelper("t", function (key: string, options: any) {
    const vars = options.hash || {};
    return new Handlebars.SafeString(t(key, vars));
  });
}

export async function sendBlockchainRegistrationConfirmationEmail(
  email: string,
  documentId: string,
  documentName: string,
  contractId: string,
  transactionId: string,
  network: string,
  registeredAt: Date,
  hash: string,
  t: (key: string, vars?: Record<string, any>) => string
): Promise<void> {
  registerHandlebarsHelpers(t);

  const html = `
    <h2>${t("custom.document_registered_blockchain")}</h2>
    <p>Documento <b>${documentName}</b> (${documentId}) ${t(
    "custom.has_been_registered_blockchain"
  )}</p>
    <ul>
      <li><b>Contract ID: </b> ${contractId}</li>
      <li><b>Transaction ID: </b> ${transactionId}</li>
      <li><b>Network: </b> ${network}</li>
      <li><b>Hash: </b> ${hash}</li>
      <li><b>Registered at: </b> ${registeredAt.toLocaleString()}</li>
    </ul>
  `;

  await RabbitMQService.publishTransactionalEmailQueue(
    `${t("email.team_adamo_name").toUpperCase()} <${process.env.MAIL_SENDER}>`, // from
    email, // email
    t("email.document_registered_blockchain_subject", {
      documentName,
    }).toUpperCase(), // subject
    `${t("entities.document")} ${documentName} (${documentId}) ${t(
      "email.has_been_registered_blockchain"
    ).toUpperCase()}\nContract ID: ${contractId}\nTransaction ID: ${transactionId}\nNetwork: ${network}\nHash: ${hash}\nFecha: ${registeredAt.toLocaleString()}`, // texto
    html // content
  );
}

// ********************** RABBQITMQ SERVICE **********************

export async function sendBlockchainRegisterConfirmEmail(
  email: string,
  data: {
    documentId: string;
    documentName: string;
    contractId: string;
    transactionId: string;
    network: string;
    registeredAt: Date;
    hash: string;
  },
  t: (key: string, vars?: Record<string, any>) => string
): Promise<void> {
  registerHandlebarsHelpers(t);

  const html = `
    <h2>${t("custom.document_registered_blockchain")}</h2>
    <p>Documento <b>${data.documentName}</b> (${data.documentId}) ${t(
    "custom.has_been_registered_blockchain"
  )}</p>
    <ul>
      <li><b>Contract ID: </b> ${data.contractId}</li>
      <li><b>Transaction ID: </b> ${data.transactionId}</li>
      <li><b>Network: </b> ${data.network}</li>
      <li><b>Hash: </b> ${data.hash}</li>
      <li><b>Registered at: </b> ${data.registeredAt.toLocaleString()}</li>
    </ul>
  `;

  await RabbitMQService.publishTransactionalEmailQueue(
    `${t("email.team_adamo_name").toUpperCase()} <${process.env.MAIL_SENDER}>`, // from
    email, // email
    t("email.document_registered_blockchain_subject", {
      documentName: data.documentName,
    }).toUpperCase(), // subject
    `${t("entities.document")} ${data.documentName} (${data.documentId}) ${t(
      "email.has_been_registered_blockchain"
    ).toUpperCase()}\nContract ID: ${data.contractId}\nTransaction ID: ${
      data.transactionId
    }\nNetwork: ${data.network}\nHash: ${
      data.hash
    }\nFecha: ${data.registeredAt.toLocaleString()}`, // texto
    html // content
  );
}

export async function sendDocumentSignAssignmentEmail(
  email: string,
  data: {
    profile_image: string;
    sign_name_requester: string;
    guest_name: string;
    document_name: string;
    document_link: string;
  },
  t: (key: string, vars?: Record<string, any>) => string
): Promise<void> {
  registerHandlebarsHelpers(t);

  const templatePath = path.join(
    __dirname,
    "./templates",
    "request-sign.template.html"
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
      profile_image: data.profile_image,
      sign_name_requester: data.sign_name_requester,
      guest_name: data.guest_name,
      document_name: data.document_name,
      document_link: data.document_link,
    };
    var result = template(data);

    console.log("Email content generated OK");
    await RabbitMQService.publishTransactionalEmailQueue(
      `${t("email.team_adamo_name").toUpperCase()} <${
        process.env.MAIL_SENDER
      }>`, // from
      email, // email
      t("email.assigned_to_sign").toUpperCase(), // subject
      t("email.assigned_to_sign").toUpperCase(), // text
      result // content
    );
  } catch (error) {
    throw new HttpError(400, t("custom.failed_send_assignment_email"));
  }
}

export async function sendRejectedDocumentEmail(
  email: string,
  signer_name: string,
  document_name: string,
  signer_comment: string,
  document_link: string,
  t: (key: string, vars?: Record<string, any>) => string
): Promise<void> {
  registerHandlebarsHelpers(t);

  const templatePath = path.join(
    __dirname,
    "./templates",
    "declined-doc.template.html"
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
      signer_name,
      document_name,
      signer_comment,
      date: formattedDate,
      document_link,
    };
    var result = template(data);

    await RabbitMQService.publishTransactionalEmailQueue(
      `${t("email.team_adamo_name").toUpperCase()} <${
        process.env.MAIL_SENDER
      }>`, // from
      email, // to
      t("email.participant_rejected").toUpperCase(), // subject
      t("email.signature_rejected").toUpperCase(), // text
      result // content
    );
  } catch (error) {
    throw new HttpError(
      400,
      t("custom.failed_send_participant_rejected_email")
    );
  }
}

export async function sendSignDocumentConfirmEmail(
  email: string,
  data: {
    documentId: string;
    documentName: string;
    contractId: string;
    transactionId: string;
    network: string;
    registeredAt: Date;
    hash: string;
  },
  t: (key: string, vars?: Record<string, any>) => string
): Promise<void> {
  registerHandlebarsHelpers(t);

  const html = `
    <h2>${t("custom.document_signed_and_registered")}</h2>
    <p>${t("custom.the_document")} <b>${data.documentName}</b> (${
    data.documentId
  }) ${t("custom.has_been_signed_and_registered")}</p>
    <ul>
      <li><b>${t("custom.contract_id")}:</b> ${data.contractId}</li>
      <li><b>${t("custom.transaction_id")}:</b> ${data.transactionId}</li>
      <li><b>${t("custom.network")}:</b> ${data.network}</li>
      <li><b>${t("custom.hash")}:</b> ${data.hash}</li>
      <li><b>${t("custom.registered_at")}:</b> ${data.registeredAt}</li>
    </ul>
  `;

  await RabbitMQService.publishTransactionalEmailQueue(
    `${t("email.team_adamo_name").toUpperCase()} <${process.env.MAIL_SENDER}>`, // from
    email, // email
    t("email.document_signed_and_registered", {
      documentName: data.documentName,
    }).toUpperCase(), // subject
    `${t("entities.document")} ${data.documentName} (${data.documentId}) ${t(
      "email.has_been_signed_and_registered"
    ).toUpperCase()}\nContract ID: ${data.contractId}\nTransaction ID: ${
      data.transactionId
    }\nNetwork: ${data.network}\nHash: ${
      data.hash
    }\nFecha: ${data.registeredAt.toLocaleString()}`, // texto
    html // content
  );
}
