import { EParticipantStatus } from "../../domain/models/document.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { formatYupErrors } from "../../utils/formatYupErrors";
import { HttpError } from "../../utils/httpError";
import { getDeleteSignerSchema } from "../../validators/deleteSigner.validator";

export class ReSignSignerDocumentUseCase {
  constructor(private repo: DocumentsRepository) {}

  async execute(
    userId: string,
    documentId: string,
    signerId: string,
    t: (key: string, options?: Record<string, any>) => string
  ): Promise<void> {
    const latestVersion = await this.repo.findLatestVersion(userId, documentId);
    if (!latestVersion) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", { entity: t("entities.document") })
      );
    }

    const participant = await this.repo.getSignerById(signerId);

    if (participant && participant.status !== EParticipantStatus.PENDING) {
      throw new HttpError(400, t("custom.signer_not_posible_resign"));
    }

    if (participant) {
      // Actualiza el participante en la versión actual
      const updatedParticipants = latestVersion.participants.map((p: any) =>
        p.uuid === signerId ? { ...p, status: EParticipantStatus.PENDING } : p
      );

      // Crea una nueva versión del documento con el participante actualizado
      const newVersion = {
        ...latestVersion,
        _id: undefined, // para que se genere un nuevo id
        version: latestVersion.version + 1,
        participants: updatedParticipants,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const doc = await this.repo.createNewVersion(newVersion);

      return doc;
    }
  }
}
