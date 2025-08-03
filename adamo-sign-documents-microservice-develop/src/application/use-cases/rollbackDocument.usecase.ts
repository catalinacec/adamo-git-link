import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { HttpError } from "../../utils/httpError";

export class RollbackDocumentUseCase {
  constructor(
    private readonly documentVersionRepository: DocumentsRepository
  ) {}

  async execute(
    userId: string,
    documentId: string,
    versionId: string,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    if (!versionId) {
      throw new HttpError(
        400,
        t("validation.required", { field: "versionId" })
      );
    }

    if (!documentId) {
      throw new HttpError(
        400,
        t("validation.required", { field: "documentId" })
      );
    }

    // Find the version to rollback to
    const versionToRollback =
      await this.documentVersionRepository.findDocVersionById(
        userId,
        documentId,
        versionId
      );

    if (!versionToRollback) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", {
          entity: t("entities.version"),
        })
      );
    }

    // Get the latest version to increment its version number
    const latestVersion =
      await this.documentVersionRepository.findLatestVersion(
        userId,
        documentId
      );
    const newVersionNumber =
      latestVersion && latestVersion.version ? latestVersion.version : 1;

    // Create a new version with the content of the selected version
    const newVersionData = {
      ...versionToRollback,
      _id: undefined, // Remove _id so MongoDB creates a new one
      createdAt: new Date(),
      updatedAt: new Date(),
      isRollback: true,
      originalVersionId: versionId,
      version: newVersionNumber,
    };

    const newVersion = await this.documentVersionRepository.createNewVersion(
      newVersionData
    );

    return newVersion;
  }
}
