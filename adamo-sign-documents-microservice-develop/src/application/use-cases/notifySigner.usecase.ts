import crypto from "crypto";
import { SigningLinkModel } from "../../infrastructure/repositories/signin-link.repository";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import jwt from "jsonwebtoken";
import { sendDocumentSignAssignmentEmail } from "../services/email.service";
import { HttpError } from "../../utils/httpError";
import { UserRepository } from "../../infrastructure/repositories/user.repository";

export class NotifySignerUseCase {
  constructor(private readonly documentRepository: DocumentsRepository) {}

  async execute(
    documentId: string,
    signerId: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<string> {
    console.log("Executing NotifySignerUseCase...", {
      documentId,
      signerId,
    });
    const document = await this.documentRepository.findLatestVersionByDocId(
      documentId
    );
    console.log("Document found OK ", document);
    const signer = await this.documentRepository.getSignerById(signerId);

    console.log("Signer found OK ", signer?.uuid);
    if (!signer) {
      throw new HttpError(404, t("errors.signerNotFound", { signerId }));
    }

    console.log("Generating signing link for document ", documentId);
    const expiresAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
    const expireWithoutDate = 6 * 30 * 24 * 60 * 60 * 1000;
    const token = jwt.sign(
      {
        id: signer.uuid,
        uuid: signer.uuid,
        sub: signer.uuid,
        // aud: process.env.JWT_AUDIENCE,
      },
      (process.env.JWT_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
      {
        algorithm: "RS256",
        keyid: "adamo-sign-key",
        expiresIn: expireWithoutDate,
      }
    );

    console.log("Signing link token generated: ", token);
    await SigningLinkModel.deleteMany({ documentId, signerId: signer.uuid });

    console.log("Old signing links deleted for document ", documentId);
    await SigningLinkModel.create({
      token,
      documentId,
      signerId: signer.uuid,
      expiresAt,
    });

    console.log("New signing link created for document ", documentId);
    const url = `${process.env.FRONTEND_URL}/documents?data=${token}`;

    console.log("Signing link URL generated: ", url);
    const userRepo = new UserRepository();
    const userOwner = await userRepo.findByOwnerId(document?.owner || "");

    console.log("User owner found: ", userOwner?._id);
    if (signer.email) {
      console.log("Sending email to signer ", signer.email);
      await sendDocumentSignAssignmentEmail(
        signer.email, // email
        {
          profile_image:
            userOwner?.profileImageUrl ??
            "https://dev-sign.adamoservices.co/_next/static/emails-template-images/no_profile_pic.png", // profile_image
          sign_name_requester: userOwner?.name || "", // sign_name_requester
          guest_name: signer.first_name, // guest_name
          document_name: document?.filename || "Documento", // document_name
          document_link: url, // document_link
        },
        t
      );
      console.log("Email sent to signer ", signer.email);
    }

    return url;
  }
}
