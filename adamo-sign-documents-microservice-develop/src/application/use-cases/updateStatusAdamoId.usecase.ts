import { EDocumentStatus } from "../../domain/models/document.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { VerificationIdRepository } from "../../infrastructure/repositories/verification-id.repository";
import { formatYupErrors } from "../../utils/formatYupErrors";
import { HttpError } from "../../utils/httpError";
import { getErrorMessage } from "../../utils/setErrorMessage";
import { getUpdateAdamoIdSchema } from "../../validators/updateStatusAdamoId.validator";

export class UpdatetStatusAdamoIdUseCase {
  constructor(private readonly documentRepository: DocumentsRepository) {}

  async execute(
    followId: string,
    body: Record<string, any>,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    console.log("followId", followId);
    console.log("body", body);

    const schema = getUpdateAdamoIdSchema(t);
    try {
      await schema.validate(
        { followId, completedAt: body.completedAt, status: body.status },
        { abortEarly: false }
      );
    } catch (err: any) {
      if (err.name === "ValidationError" && Array.isArray(err.errors)) {
        const formattedErrors = formatYupErrors(err.inner, t);
        throw new HttpError(
          400,
          t("validation.general_error"),
          undefined,
          undefined,
          formattedErrors
        );
      }

      throw err;
    }

    const documents = await this.documentRepository.getAllLatestDocuments();
    const document = documents.find((doc) =>
      doc.participants.some(
        (participant) => participant.followValidId === followId
      )
    );

    if (!document) {
      throw new HttpError(404, t("document.notFound"));
    }

    const participant = document.participants.find(
      (p) => p.followValidId === followId
    );

    if (!participant) {
      throw new HttpError(404, t("participant.notFound"));
    }

    participant.statusValidation = body.status;

    console.log("participant.statusValidation", participant.statusValidation);
    await this.documentRepository.updateSigner(
      document.owner,
      document.documentId,
      participant.uuid,
      participant
    );

    const verificationIdRepository = new VerificationIdRepository();
    const verificationId = await verificationIdRepository.findByFollowValidId(
      followId
    );

    if (!verificationId) {
      throw new HttpError(404, t("verificationId.notFound"));
    }

    await verificationIdRepository.update(verificationId._id, {
      statusValidation: body.status,
      updatedAt: new Date(),
    });

    console.log("Document updated successfully");
    return true;
  }
}
