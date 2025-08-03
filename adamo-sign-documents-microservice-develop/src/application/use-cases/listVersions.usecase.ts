import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { HttpError } from "../../utils/httpError";

export class ListVersionsUseCase {
  constructor(
    private readonly documentVersionRepository: DocumentsRepository
  ) {}

  async execute(
    documentId: string,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    if (!documentId) {
      throw new HttpError(
        400,
        t("errors.validation.required", {
          field: t("fields.documentId"),
        })
      );
    }
    return this.documentVersionRepository.findAllVersions(documentId);
  }
}
