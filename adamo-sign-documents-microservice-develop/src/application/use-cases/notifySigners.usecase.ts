// src/application/use-cases/generateSigningLink.usecase.ts
import crypto from "crypto";
import { SigningLinkModel } from "../../infrastructure/repositories/signin-link.repository";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import jwt from "jsonwebtoken";
import { sendDocumentSignAssignmentEmail } from "../services/email.service";
import { TrackerDocumentsService } from "../services/tracker-documents.service";
import { HttpError } from "../../utils/httpError";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { RabbitMQService } from "../services/rabbitmq.service";
import { EParticipantStatus } from "../../domain/models/document.entity";

export class NotifySignersUseCase {
  constructor(private readonly documentRepository: DocumentsRepository) {}

  async execute(
    documentId: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<string> {
    const document = await this.documentRepository.findLatestVersionByDocId(
      documentId
    );

    if (!document) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", {
          entity: t("entities.document"),
        })
      );
    }

    const signers = await this.documentRepository.getSigners(documentId);

    if (!signers || signers.length === 0) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", {
          entity: t("entities.signers"),
        })
      );
    }

    const expiresAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
    const expireWithoutDate = 6 * 30 * 24 * 60 * 60 * 1000;
    const tokensAndUrls = await Promise.all(
      signers
        .filter((signer) => signer.status == EParticipantStatus.PENDING)
        .map(async (signer) => {
          const token = jwt.sign(
            {
              id: signer.uuid,
              uuid: signer.uuid,
              sub: signer.uuid,
              aud: process.env.JWT_AUDIENCE,
            },
            (process.env.JWT_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
            {
              algorithm: "RS256",
              keyid: "adamo-sign-key",
              expiresIn: expireWithoutDate,
            }
          );

          await SigningLinkModel.deleteMany({
            documentId,
            signerId: signer.uuid,
          });

          await SigningLinkModel.create({
            token,
            documentId,
            signerId: signer.uuid,
            expiresAt,
          });

          return {
            token,
            url: `${process.env.FRONTEND_URL}/documents?data=${token}`,
            signerId: signer.uuid,
          };
        })
    );

    const userRepo = new UserRepository();
    const userOwner = await userRepo.findByOwnerId(document?.owner || "");

    for (const { signerId, url } of tokensAndUrls) {
      const signer = signers.find((s) => s.uuid === signerId);
      if (signer && signer.email) {
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
      }
    }

    const tracker = new TrackerDocumentsService();
    await tracker.trackAction({
      documentId,
      userId: "Guess",
      request: {
        documentId,
        signers: signers.map((s) => s.uuid),
      },
      action: "notify",
      status: "pending",
    });

    return t("common.success", {
      entity: t("entities.signers"),
      action: t("actions.notify"),
    });
  }
}
