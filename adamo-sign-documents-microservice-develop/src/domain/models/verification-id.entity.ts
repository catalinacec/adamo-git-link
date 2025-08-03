import { EAdamoIdStatus } from "../../application/services/adamo-id.service";

export class VerificationIdEntity {
  constructor(
    public _id: string,
    public uuid: string,
    public documentId: string,
    public signerId: string,
    public urlValidation: string | null,
    public followValidId: string | null,
    public statusValidation: EAdamoIdStatus | null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
