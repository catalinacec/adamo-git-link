import {
  ActionsSigner,
  ETypeNotification,
} from "../../domain/models/participant.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { HttpError } from "../../utils/httpError";
import { getAddSignerSchema } from "../../validators/addParticipant.validator";

export class AddSignerUseCase {
  constructor(private documentsRepository: DocumentsRepository) {}

  async execute(
    userId: string,
    documentId: string,
    participants: any[],
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<any> {
    // 💡 Aquí se valida correctamente el esquema
    // await addSignerSchema.validate({ participants }, { abortEarly: false });
    const schema = getAddSignerSchema(t);

    try {
      await schema.validate({ participants }, { abortEarly: false });
    } catch (err: any) {
      throw new HttpError(
        400,
        t("participant.invalid_summary"),
        undefined,
        undefined,
        err.errors
      );
    }

    // Convertir los objetos a JSON plano para MongoDB
    const plainParticipants = participants.map((p) => ({
      uuid: p.uuid,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone: p.phone ?? null, // Asegurarse de que sea null si no está definido
      order: p.order,
      requireValidation: p.requireValidation,
      typeValidation: p.typeValidation,
      dataValidation: p.dataValidation,
      urlValidation: p.urlValidation,
      statusValidation: p.statusValidation,
      followValidId: p.followValidId,
      typeNotification: p.typeNotification ?? ETypeNotification.EMAIL,
      isActive: p.isActive,
      status: p.status,
      signatures: p.signatures.map((s: any) => ({
        id: s.id,
        recipientEmail: s.recipientEmail,
        recipientsName: s.recipientsName,
        signatureText: s.signatureText,
        signatureContentFixed: s.signatureContentFixed,
        signatureDelete: s.signatureDelete,
        signatureIsEdit: s.signatureIsEdit,
        slideElement: s.slideElement,
        slideIndex: s.slideIndex,
        top: s.top,
        left: s.left,
        width: s.width,
        height: s.height,
        rotation: s.rotation,
        color: s.color,
      })),
      historySignatures: {
        hasSigned: p.historySignatures.hasSigned,
        hasRejected: p.historySignatures.hasRejected,
        rejectionReason: p.historySignatures.rejectionReason,
        signatureType: p.historySignatures.signatureType,
        signatureImageUrl: p.historySignatures.signatureImageUrl,
        signatureText: p.historySignatures.signatureText,
        signatureFontFamily: p.historySignatures.signatureFontFamily,
        canSign: p.historySignatures.canSign,
        signedAt: p.historySignatures.signedAt,
        rejectedAt: p.historySignatures.rejectedAt,
        ip: p.historySignatures.ip,
        userAgent: p.historySignatures.userAgent,
        auditLog: p.historySignatures.auditLog.map((log: ActionsSigner) => ({
          action: log.action,
          timestamp: log.timestamp,
          reason: log.reason,
        })),
      },
      signerLink: p.signerLink,
    }));

    const response = await this.documentsRepository.addSigners(
      userId,
      documentId,
      plainParticipants
    );

    return response;
  }
}
