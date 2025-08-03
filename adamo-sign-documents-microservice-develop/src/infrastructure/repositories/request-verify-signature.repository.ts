// src/infrastructure/models/signerAction.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { ReqVerifySignatureDocument } from "../../domain/models/req-verify-signature.entity";
import { IRequestVerifySignatureRepository } from "../../domain/repositories/IRequestVerifySignaturesRepository";

interface IRequestVerifySignature extends Document {
  userId: string;
  hash: string;
  documentId: string;
  version: string;
  timestamp: Date;
}

const RequestVerifySignatureSchema = new Schema(
  {
    userId: { type: String, required: true },
    hash: { type: String, required: true },
    documentId: { type: String, required: true },
    version: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const RequestVerifySignatureModel =
  mongoose.model<IRequestVerifySignature>(
    "RequestVerifySignature",
    RequestVerifySignatureSchema
  );

export class RequestVerifySignatureRepository
  implements IRequestVerifySignatureRepository
{
  /**
   * Guarda un nuevo registro de verificación de firma.
   */
  async save(
    req: ReqVerifySignatureDocument
  ): Promise<ReqVerifySignatureDocument> {
    console.log("Saving request for signature verification:", req);
    const doc = new RequestVerifySignatureModel({
      userId: req.userId,
      hash: req.hash,
      documentId: req.documentId,
      version: req.version,
      timestamp: req.timestamp,
    });
    console.log("Created Mongoose document:", doc);

    const saved = await doc.save();
    console.log("Mongoose document saved successfully:", saved);

    // Mapear el resultado de Mongoose de vuelta a la entidad de dominio
    return new ReqVerifySignatureDocument(
      saved.id,
      saved.hash,
      saved.userId,
      saved.documentId,
      saved.version,
      saved.timestamp
    );
  }
}
