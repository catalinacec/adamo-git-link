import { EDocumentStatus } from "../../domain/models/document.entity";
import { ReqVerifySignatureDocument } from "../../domain/models/req-verify-signature.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { RequestVerifySignatureRepository } from "../../infrastructure/repositories/request-verify-signature.repository";
import { formatYupErrors } from "../../utils/formatYupErrors";
import { HttpError } from "../../utils/httpError";
import { getErrorMessage } from "../../utils/setErrorMessage";
import { getVerifySignatureSchema } from "../../validators/verifySignature.validator";

const EXPIRATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

export class VerifySignatureUseCase {
  constructor(
    private readonly documentRepository: DocumentsRepository,
    private readonly reqSignatureRepository: RequestVerifySignatureRepository
  ) {}

  async execute(
    userId: string,
    hash: string,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    // 01. Validate the hash parameter
    const schema = getVerifySignatureSchema(t);
    console.log("Validating hash:", hash);
    try {
      await schema.validate({ hash }, { abortEarly: false });
      console.log("Hash validation successful");
    } catch (err: any) {
      console.log("Hash validation failed:", err);
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

    // 3) Consulta al repositorio con manejo de downtime
    let document;
    try {
      console.log("Fetching document by metadata hash");
      document = await this.documentRepository.findByMetadataHashBlockchain(
        hash
      );

      // 2) Log de la petición
      console.log("Logging request for signature verification");
      const logEntry = new ReqVerifySignatureDocument(
        "",
        hash,
        userId,
        document ? document.documentId : "",
        document ? `${document.version}` : "",
        new Date()
      );
      console.log("Request log entry created:", logEntry);
      const res = await this.reqSignatureRepository.save(logEntry);
      console.log("Request log entry saved successfully", res);
      console.log("Document fetched successfully");
    } catch (_) {
      console.log("Registry unavailable, returning 503");
      throw new HttpError(503, t("custom.registry_unavailable"));
    }

    console.log("Validate document not found");
    if (!document) {
      throw new HttpError(
        404,
        t("errors.resource.not_found", {
          entity: t("entities.document"),
        })
      );
    }

    // 4) Última versión y concordancia de hash
    const lastVersion = await this.documentRepository.findLatestVersion(
      document.owner,
      document.documentId
    );
    console.log("Last version fetched");

    if (!lastVersion || lastVersion.metadata.hash !== hash) {
      console.log("Invalid hash for the latest version");
      throw new HttpError(
        400,
        t("errors.document.invalid_hash_latest_version")
      );
    }
    // aeb2393d338dc32c7fa73ccfc01744997da03068ad4d670f174750accfa5d18c

    // 5) Estado en blockchain
    console.log("Checking blockchain status for document");
    const bc = document.blockchain;
    if (bc && bc.status !== "success") {
      // expirado?
      if (
        bc.registeredAt &&
        Date.now() - bc.registeredAt.getTime() > EXPIRATION_MS
      ) {
        throw new HttpError(410, t("errors.document.hash_expired"));
      }
      throw new HttpError(400, t("errors.document.hash_not_registered"));
    }

    console.log("Document is valid and registered on blockchain");
    // 6) Construir metadata de firmantes
    const signerMetadata = document.participants.map((p: any) => ({
      name: p.first_name,
      surname: p.last_name,
      documentNumber: p.historySignatures?.signatureImageUrl ?? "",
      documentType: p.historySignatures?.signatureType ?? "",
    }));

    console.log("Signer metadata constructed");
    // return { isValid: true, ...lastVersion, verifiedAt: new Date() };
    return { isValid: true, signerMetadata, verifiedAt: new Date() };
  }
}
