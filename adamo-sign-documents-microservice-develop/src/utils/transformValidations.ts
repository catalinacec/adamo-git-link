import { AdamoIdValidation } from "../domain/models/adamo-id.model";
import { EParticipantValidation } from "../domain/models/participant.entity";

const participantToAdamoValidationMap: Record<
  EParticipantValidation,
  AdamoIdValidation
> = {
  [EParticipantValidation.SELFIE]: AdamoIdValidation.FaceRecognition,
  [EParticipantValidation.IDENTITY_DOCUMENT_PHOTO]: AdamoIdValidation.Identity,
  [EParticipantValidation.IDENTITY_VALIDATION]: AdamoIdValidation.Identity,
  [EParticipantValidation.FACIAL]: AdamoIdValidation.FaceRecognition,
  [EParticipantValidation.PHONE]: AdamoIdValidation.Phone,
  [EParticipantValidation.EMAIL]: AdamoIdValidation.Email,
  [EParticipantValidation.DOCUMENT]: AdamoIdValidation.Identity,
  [EParticipantValidation.NONE]: AdamoIdValidation.Identity,
};

export function mapParticipantToAdamoValidation(
  validation: EParticipantValidation
): AdamoIdValidation | undefined {
  return participantToAdamoValidationMap[validation];
}
