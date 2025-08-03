import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { formatYupErrors } from "../../utils/formatYupErrors";
import { HttpError } from "../../utils/httpError";
import { getDeleteSignerSchema } from "../../validators/deleteSigner.validator";

export class DeleteSignerUseCase {
  constructor(private documentsRepository: DocumentsRepository) {}

  async execute(
    userId: string,
    documentId: string,
    signerId: string,
    t: (key: string, options?: Record<string, any>) => string
  ): Promise<void> {
    const schema = getDeleteSignerSchema(t);
    try {
      await schema.validate(
        { userId, documentId, signerId },
        { abortEarly: false }
      );
    } catch (err: any) {
      if (err.name === "ValidationError" && Array.isArray(err.errors)) {
        const formattedErrors = formatYupErrors(err.inner, t);
        throw new HttpError(
          400,
          t("participant.invalid_summary"),
          undefined,
          undefined,
          formattedErrors
        );
      }

      throw err;
    }

    await this.documentsRepository.deleteSigner(userId, documentId, signerId);
  }
}
