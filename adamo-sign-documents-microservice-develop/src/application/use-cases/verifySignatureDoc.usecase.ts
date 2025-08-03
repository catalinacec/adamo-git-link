import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { RequestVerifySignatureRepository } from "../../infrastructure/repositories/request-verify-signature.repository";
import { formatYupErrors } from "../../utils/formatYupErrors";
import { HttpError } from "../../utils/httpError";
import { getVerifySignatureDocSchema } from "../../validators/verifySignatureDoc.validator";

export class VerifySignatureDocUseCase {
  constructor(
    private readonly documentRepository: DocumentsRepository,
    private readonly reqSignatureRepository: RequestVerifySignatureRepository
  ) {}

  async execute(
    userId: string,
    hash: string,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    // const reqVerySig = new ReqVerifySignatureDocument(
    //   "",
    //   hash,
    //   userId,
    //   "",
    //   "",
    //   new Date()
    // );
    // const resAction = await this.reqSignatureRepository.save(reqVerySig);

    // console.log("resAction", resAction);

    const schema = getVerifySignatureDocSchema(t);
    try {
      await schema.validate({ hash }, { abortEarly: false });
    } catch (err: any) {
      if (err.name === "ValidationError" && Array.isArray(err.errors)) {
        const formattedErrors = formatYupErrors(err.inner, t);
        throw new HttpError(
          400,
          t("errors.document.missing_parameters"),
          undefined,
          undefined,
          formattedErrors
        );
      }

      throw err;
    }

    const document = await this.documentRepository.findByMetadataHash(hash);

    if (!document) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", {
          entity: t("entities.document"),
        })
      );
    }

    // Verifica si este documento es la última versión
    const lastVersion = await this.documentRepository.findLatestVersion(
      document.owner,
      document.documentId
    );

    if (!lastVersion || lastVersion.metadata.hash !== hash) {
      throw new HttpError(
        400,
        t("errors.document.invalid_hash_latest_version")
      );
    }

    return { ...lastVersion, isValid: true };
  }
}
