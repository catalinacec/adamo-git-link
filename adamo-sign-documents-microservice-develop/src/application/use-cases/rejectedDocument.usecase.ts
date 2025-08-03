import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { HttpError } from "../../utils/httpError";
import { sendRejectedDocumentEmail } from "../services/email.service";
import { TrackerDocumentsService } from "../services/tracker-documents.service";

export class RejectedDocumentUseCase {
  constructor(
    private readonly documentVersionRepository: DocumentsRepository
  ) {}

  async execute(
    documentId: string,
    signer: string,
    reason: string,
    token: string,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    if (!documentId) {
      throw new HttpError(
        400,
        t("validation.required", { field: "documentId" })
      );
    }

    // Buscar el documento más reciente
    const document =
      await this.documentVersionRepository.findLatestVersionBySigner(
        documentId
      );

    if (!document) {
      return {
        success: false,
        message: t("errors.resource.not_found", {
          entity: t("entities.document"),
        }),
      };
    }

    // Buscar el participante correspondiente (por uuid)
    const participant = document.participants?.find(
      (p: any) => p.uuid == signer
    );

    if (!participant) {
      throw new HttpError(
        400,
        t("errors.resource.not_found", {
          entity: t("entities.signer"),
        })
      );
    }
    console.log("participant", participant);

    // Validar si puede firmar
    if (!participant.historySignatures.canSign) {
      console.log(
        "participant.historySignatures.canSign",
        participant.historySignatures.canSign
      );
      throw new HttpError(400, t("errors.signer.cannot_sign"));
    }

    console.log("Todo ok");

    // Actualizar el estado de rechazo usando updateSigner
    await this.documentVersionRepository.updateSignerBySignerId(
      signer,
      documentId,
      {
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
      }
    );
    console.log("Signer updated successfully");

    await this.documentVersionRepository.updateDocumentStatus(
      documentId,
      "rejected"
    );

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
                rejectedBy: signer,
                reason,
              },
            },
          }),
        }
      );

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
      request: { signer, reason },
      action: "notify",
      status: "pending",
    });

    return {
      success: true,
      message: t("custom.rejected_successfully"),
    };
  }
}
