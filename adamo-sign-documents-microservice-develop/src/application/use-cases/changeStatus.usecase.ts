import { EDocumentStatus } from "../../domain/models/document.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { HttpError } from "../../utils/httpError";
import { getErrorMessage } from "../../utils/setErrorMessage";

export class ChangeStatusUseCase {
  constructor(private readonly documentRepository: DocumentsRepository) {}

  async execute(
    userId: string,
    documentId: string,
    status: EDocumentStatus,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    if (!documentId) {
      throw new HttpError(
        400,
        t("validation.required", { field: "documentId" })
      );
    }

    // Traer la última versión del documento
    const lastVersion = await this.documentRepository.findLatestVersion(
      userId,
      documentId
    );
    if (!lastVersion) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", {
          entity: t("entities.document"),
        })
      );
    }

    if (status === EDocumentStatus.SENT) {
      await this.documentRepository.updateDocumentStatus(
        documentId,
        "in_progress"
      );
    }

    const newVersion = {
      ...lastVersion,
      id: undefined,
      version: lastVersion.version + 1,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.documentRepository.save(newVersion);
  }
}
