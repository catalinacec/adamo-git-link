import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { HttpError } from "../../utils/httpError";
export class RestoreDocumentUseCase {
  constructor(
    private readonly documentVersionRepository: DocumentsRepository
  ) {}

  async execute(
    userId: string,
    documentId: string,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    if (!documentId) {
      throw new HttpError(
        400,
        t("validation.required", { field: "documentId" })
      );
    }

    // Restore all document versions by updating their status
    const result = await this.documentVersionRepository.updateMany(
      { owner: userId, documentId },
      { status: "draft", isActive: true, isRecycler: false, isDeleted: false }
    );

    if (result && result.modifiedCount > 0) {
      return {
        success: true,
        message: t("errors.document.restore_success"),
      };
    } else {
      return {
        success: false,
        message: t("errors.document.restore_none_updated"),
      };
    }
  }
}
