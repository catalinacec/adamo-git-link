import { EDocumentStatus } from "../../domain/models/document.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { HttpError } from "../../utils/httpError";
import { getErrorMessage } from "../../utils/setErrorMessage";
import { AdamoIdService, EAdamoIdStatus } from "../services/adamo-id.service";

export class CurrentStatusAdamoIdUseCase {
  constructor(private readonly documentRepository: DocumentsRepository) {}

  async execute(
    documentId: string,
    signerId: string,
    followId: string,
    token: string,
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    // const adamoIdService = new AdamoIdService();

    if (!documentId) {
      throw new HttpError(
        400,
        t("validation.required", { field: "documentId" })
      );
    }

    // Traer la última versión del documento
    const lastVersion = await this.documentRepository.findLatestVersionByDocId(
      documentId
    );

    const participantIndex = lastVersion?.participants.findIndex(
      (p) => p.uuid === signerId && p.followValidId === followId
    );

    if (
      participantIndex === undefined ||
      participantIndex === -1 ||
      !lastVersion?.participants[participantIndex]
    ) {
      throw new HttpError(404, t("custom.participant_not_found"));
    }

    if (
      lastVersion.participants[participantIndex].requireValidation === false
    ) {
      throw new HttpError(400, t("custom.no_validations_pending"));
    }

    const res = await AdamoIdService.getStatusFollowAdamoId(
      documentId,
      signerId,
      followId,
      token
    );

    console.log("Response from Adamo ID status validation:", res);

    // lastVersion.participants[participantIndex].statusValidation = res.status;

    let message = "";
    if (
      lastVersion.participants[participantIndex].statusValidation ==
      EAdamoIdStatus.NOT_INITIATED
    ) {
      message = t("custom.validations_not_completed");
    }

    if (
      lastVersion.participants[participantIndex].statusValidation ==
      EAdamoIdStatus.FAILED
    ) {
      message = t("custom.validations_failed_generic");
    }

    if (
      lastVersion.participants[participantIndex].statusValidation ==
      EAdamoIdStatus.PROCESSING
    ) {
      message = t("custom.validations_processing");
    }

    console.log("Current status Adamo ID:", {
      status: lastVersion.participants[participantIndex].statusValidation,
      message,
    });

    const finalDoc = await this.documentRepository.findLatestVersionByDocId(
      documentId
    );

    const partIndex = finalDoc?.participants.findIndex(
      (p) => p.uuid === signerId && p.followValidId === followId
    );

    return {
      status: finalDoc!.participants[partIndex!].statusValidation,
      message,
    };
  }
}
