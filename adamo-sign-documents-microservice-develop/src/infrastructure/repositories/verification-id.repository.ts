import mongoose, { Schema, Document } from "mongoose";
import { EAdamoIdStatus } from "../../application/services/adamo-id.service";
import { VerificationIdEntity } from "../../domain/models/verification-id.entity";

interface IVerificationId extends Document {
  uuid: string;
  documentId: string;
  signerId: string;
  urlValidation: string | null;
  followValidId: string | null;
  statusValidation: EAdamoIdStatus | null;
}

const VerificationIdActionSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    documentId: { type: String, required: true },
    signerId: { type: String, required: true },
    urlValidation: { type: String, default: null },
    followValidId: { type: String, default: null },
    statusValidation: {
      type: String,
      enum: Object.values([
        "NOT_INITIATED",
        "FAILED",
        "PROCESSING",
        "COMPLETED",
      ]),
      default: null,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const VerificationIdModel = mongoose.model<IVerificationId>(
  "VerificationId",
  VerificationIdActionSchema
);

export class VerificationIdRepository {
  private map(doc: IVerificationId): VerificationIdEntity {
    return new VerificationIdEntity(
      (doc._id as mongoose.Types.ObjectId).toString(),
      doc.uuid,
      doc.documentId,
      doc.signerId,
      doc.urlValidation,
      doc.followValidId,
      doc.statusValidation
    );
  }

  async save(
    verificationId: VerificationIdEntity
  ): Promise<VerificationIdEntity> {
    const doc = await VerificationIdModel.create({
      uuid: verificationId.uuid,
      documentId: verificationId.documentId,
      signerId: verificationId.signerId,
      urlValidation: verificationId.urlValidation,
      followValidId: verificationId.followValidId,
      statusValidation: verificationId.statusValidation,
    });
    return this.map(doc);
  }

  async findByFollowValidId(
    followValidId: string
  ): Promise<VerificationIdEntity | null> {
    const doc = await VerificationIdModel.findOne({ followValidId });
    return doc ? this.map(doc) : null;
  }

  async update(
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
  ): Promise<VerificationIdEntity | null> {
    const doc = await VerificationIdModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
    return doc ? this.map(doc) : null;
  }
}
