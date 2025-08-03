// src/application/use-cases/registerDocument.usecase.ts
import { IDocumentsRepository } from "../../domain/repositories/IDocumentsRepository";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import {
  EDocumentStatus,
  EParticipantStatus,
} from "../../domain/models/document.entity";
import { S3Service } from "../../application/services/s3.service";
import { sendRejectedDocumentEmail } from "../services/email.service";
import { HttpError } from "../../utils/httpError";
import { formatYupErrors } from "../../utils/formatYupErrors";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { RabbitMQService } from "../services/rabbitmq.service";
import { SigningLinkModel } from "../../infrastructure/repositories/signin-link.repository";
import { getSignSignerDocumentSchema } from "../../validators/signSignerDocument.validator";
import { formatYupSignaturesErrors } from "../../utils/formatYupSignaturesErrors";
import { PdfSignService } from "../services/pdfSign.service";
import { TrackerDocumentsService } from "../services/tracker-documents.service";
import { EAdamoIdStatus } from "../services/adamo-id.service";

export class SignRejectedGuessUseCase {
  private s3 = new S3Service();
  private pdfSigner = new PdfSignService(this.s3);

  constructor(private repo: IDocumentsRepository) {}

  async execute(
    token: string,
    documentId: string,
    signerId: string,
    reason: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<any> {
    // 01. Validar el token
    const link = await SigningLinkModel.findOne({ token }).exec();
    console.log("link", link);

    // 02. Validar el link
    if (
      !link ||
      link.used === true ||
      !link.expiresAt ||
      isNaN(new Date(link.expiresAt).getTime()) ||
      new Date(link.expiresAt) < new Date()
    ) {
      throw new HttpError(400, t("custom.invalid_link"));
    }

    // 03. Validar el signerId y documentId
    console.log("link.signerId", link.signerId);
    if (link.signerId !== signerId) {
      console.log("link.signerId not equal to signerId");
      throw new HttpError(400, t("custom.invalid_signer"));
    }

    // 04. Validar el documentId
    if (link.documentId !== documentId) {
      console.log("link.documentId not equal to documentId");
      throw new HttpError(400, t("custom.invalid_document"));
    }

    // 05. Validar el estado del documento
    console.log("link.documentId", link.documentId);
    const participant = await this.repo.getSignerById(link.signerId);

    // 1.1. Validar si el participante tiene validaciones pendientes
    if (
      participant &&
      participant.requireValidation &&
      participant.statusValidation !== EAdamoIdStatus.COMPLETED
    ) {
      throw new HttpError(400, t("custom.participant_validation_pending"));
    }

    // 06. Validar el estado del participante
    if (participant && participant.status === EParticipantStatus.REJECTED) {
      throw new HttpError(400, t("custom.participant_rejected"));
    }

    // 07. Validar si el participante ya firmó
    if (participant && participant.status === EParticipantStatus.SIGNED) {
      throw new HttpError(400, t("custom.participant_already_signed"));
    }

    // 08. Validar si el participante puede firmar
    if (participant && !participant.historySignatures.canSign) {
      throw new HttpError(400, t("errors.signer.cannot_sign"));
    }

    // 09. Validar el estado del documento
    const document = await this.repo.findLatestVersionByDocId(link.documentId);

    // 10. Validar si el documento existe
    if (!document) {
      return {
        success: false,
        message: t("errors.resource.not_found", {
          entity: t("entities.document"),
        }),
      };
    }

    // 11. Validar el estado del documento
    if (
      document?.status == EDocumentStatus.DRAFT ||
      document?.status == EDocumentStatus.REJECTED
    ) {
      throw new HttpError(400, t("custom.document_not_in_progress"));
    }

    // 12. Comprobar si el participante existe
    if (!participant) {
      throw new HttpError(
        400,
        t("errors.resource.not_found", {
          entity: t("entities.signer"),
        })
      );
    }

    // 13. Actualizar el estado de rechazo del participante
    await this.repo.updateSignerBySignerId(link.signerId, link.documentId, {
      status: EParticipantStatus.REJECTED,
      historySignatures: {
        ...participant.historySignatures,
        hasRejected: true,
        rejectionReason: reason,
        canSign: false,
        rejectedAt: new Date(),
        ip: "",
        userAgent: "",
        auditLog: [
          ...(participant.historySignatures.auditLog || []),
          {
            action: "rejected",
            timestamp: new Date(),
            reason,
          },
        ],
      },
    });

    await this.repo.updateDocumentStatus(documentId, "rejected");

    const owner = document.owner;

    if (owner) {
      const resNotify = await fetch(
        "https://ebtuzyirod.execute-api.sa-east-1.amazonaws.com/api/v1/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: owner,
            type: "document_rejected",
            data: {
              title: "Documento rechazado",
              message: `El documento '${document.filename}' ha sido rechazado por un participante.`,
              metadata: {
                documentId,
                rejectedBy: link.signerId,
                reason,
              },
            },
          }),
        }
      );

      const userRepo = new UserRepository();
      const userOwner = await userRepo.findByOwnerId(owner);

      await sendRejectedDocumentEmail(
        userOwner?.email || "",
        participant.first_name,
        document.filename,
        reason,
        document.metadata.url,
        t
      );
    }

    const tracker = new TrackerDocumentsService();
    await tracker.trackAction({
      documentId,
      userId: owner || "Guess",
      request: { signer: link.signerId, reason },
      action: "notify",
      status: "pending",
    });

    return {
      success: true,
      message: t("custom.rejected_successfully"),
    };
  }

  async signOwnerDocument(
    userId: string,
    documentId: string,
    signerId: string,
    reason: string,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    const document = await this.repo.findLatestVersionByDocId(documentId);

    if (document && document.owner === userId) {
      return {
        success: false,
        message: t("errors.resource.not_found", {
          entity: t("entities.document"),
        }),
      };
    }

    if (!document) {
      return {
        success: false,
        message: t("errors.resource.not_found", {
          entity: t("entities.document"),
        }),
      };
    }

    const participant = await this.repo.getSignerById(signerId);

    if (participant && participant.status === EParticipantStatus.REJECTED) {
      throw new HttpError(400, t("custom.participant_rejected"));
    }

    if (participant && participant.status === EParticipantStatus.SIGNED) {
      throw new HttpError(400, t("custom.participant_already_signed"));
    }

    // Validar si puede firmar
    if (participant && !participant.historySignatures.canSign) {
      throw new HttpError(400, t("errors.signer.cannot_sign"));
    }

    if (
      document?.status == EDocumentStatus.DRAFT ||
      document?.status == EDocumentStatus.REJECTED
    ) {
      throw new HttpError(400, t("custom.document_not_in_progress"));
    }

    // Actualizar el estado de rechazo usando updateSigner
    if (!participant) {
      throw new HttpError(
        400,
        t("errors.resource.not_found", {
          entity: t("entities.signer"),
        })
      );
    }

    await this.repo.updateSignerBySignerId(signerId, documentId, {
      historySignatures: {
        ...participant.historySignatures,
        hasRejected: true,
        rejectionReason: reason,
        canSign: false,
        rejectedAt: new Date(),
        ip: "",
        userAgent: "",
        auditLog: [
          ...(participant.historySignatures.auditLog || []),
          {
            action: "rejected",
            timestamp: new Date(),
            reason,
          },
        ],
      },
    });

    await this.repo.updateDocumentStatus(documentId, "rejected");

    const owner = document.owner;

    if (owner) {
      const userRepo = new UserRepository();
      const userOwner = await userRepo.findById(owner);

      await sendRejectedDocumentEmail(
        userOwner?.email || "",
        participant.first_name,
        document.filename,
        reason,
        document.metadata.url,
        t
      );
    }

    const tracker = new TrackerDocumentsService();
    await tracker.trackAction({
      documentId,
      userId: owner || "Guess",
      request: { signer: signerId, reason },
      action: "notify",
      status: "pending",
    });

    return {
      success: true,
      message: t("custom.rejected_successfully"),
    };
  }
}
