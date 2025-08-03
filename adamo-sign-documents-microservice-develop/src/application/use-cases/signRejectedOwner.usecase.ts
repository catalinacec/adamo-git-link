// src/application/use-cases/registerDocument.usecase.ts
import { IDocumentsRepository } from "../../domain/repositories/IDocumentsRepository";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import {
  EDocumentStatus,
  EParticipantStatus,
} from "../../domain/models/document.entity";
import { S3Service } from "../services/s3.service";
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

export class SignRejectedOwnerUseCase {
  private s3 = new S3Service();
  private pdfSigner = new PdfSignService(this.s3);

  constructor(private repo: IDocumentsRepository) {}

  async execute(
    userId: string,
    documentId: string,
    signerId: string,
    reason: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<any> {
    if (!userId) {
      throw new HttpError(400, "user", "not_found");
    }

    const participant = await this.repo.getSignerById(signerId);

    // 1.1. Validar si el participante tiene validaciones pendientes
    if (
      participant &&
      participant.requireValidation &&
      participant.statusValidation !== EAdamoIdStatus.COMPLETED
    ) {
      throw new HttpError(400, t("custom.participant_validation_pending"));
    }

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

    const document = await this.repo.findLatestVersionByDocId(documentId);

    if (!document) {
      return {
        success: false,
        message: t("errors.resource.not_found", {
          entity: t("entities.document"),
        }),
      };
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
