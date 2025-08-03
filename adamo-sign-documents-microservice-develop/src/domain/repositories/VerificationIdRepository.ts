import { VerificationIdEntity } from "../models/verification-id.entity";
import { EAdamoIdStatus } from "../../application/services/adamo-id.service";

export interface IVerificationIdRepository {
  save(verificationId: VerificationIdEntity): Promise<VerificationIdEntity>;
  findByFollowValidId(
    followValidId: string
  ): Promise<VerificationIdEntity | null>;
  update(
    id: string,
    data: Partial<{
      uuid: string;
      documentId: string;
      signerId: string;
      urlValidation: string | null;
      followValidId: string | null;
      statusValidation: EAdamoIdStatus | null;
      updatedAt: Date;
    }>
  ): Promise<VerificationIdEntity | null>;
}
