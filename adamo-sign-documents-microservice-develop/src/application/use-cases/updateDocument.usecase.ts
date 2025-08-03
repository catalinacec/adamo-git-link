import { S3Service } from "../services/s3.service";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { getUpdateDocumentSchema } from "../../validators/updateDocument.validator";
import { HttpError } from "../../utils/httpError";
import { validateFileExtended } from "../../utils/extendedFileValidator";
import { ValidationError } from "yup";
import { getErrorMessage } from "../../utils/setErrorMessage";
import { EDocumentStatus } from "../../domain/models/document.entity";

export class UpdateDocumentUseCase {
  constructor(private readonly repo: DocumentsRepository) {}

  async execute(
    userId: string,
    documentId: string,
    file: Express.Multer.File | undefined,
    filename: string | undefined,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    const schema = getUpdateDocumentSchema(t);
    try {
      await schema.validate({ filename }, { abortEarly: false });
    } catch (err: any) {
      const errors =
        err instanceof ValidationError && err.errors
          ? err.errors
          : [err.message];
      throw new HttpError(
        400,
        t("validation.validation_failed"),
        undefined,
        undefined,
        errors
      );
    }

    let metadata = undefined;
    if (file) {
      await validateFileExtended(file);
      const { signedUrl, key, documentName } =
        await new S3Service().uploadAndGetPublicUrl(file, "documents");
      metadata = {
        size: file.size,
        mimetype: file.mimetype,
        url: signedUrl,
        filename: documentName,
        s3Key: key,
      };
    }

    const latestVersion = await this.repo.findLatestVersion(userId, documentId);
    if (!latestVersion) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", { entity: t("entities.document") })
      );
    }

    if (
      latestVersion.status.toLowerCase() !== EDocumentStatus.DRAFT.toLowerCase()
    ) {
      throw new HttpError(400, t("errors.document.not_editable"));
    }

    const base = {
      ...latestVersion,
      _id: undefined,
      version: latestVersion.version,
      filename: filename ?? latestVersion.filename,
      metadata: metadata ?? latestVersion.metadata,
    };

    return this.repo.createNewVersion(base);
  }
}
