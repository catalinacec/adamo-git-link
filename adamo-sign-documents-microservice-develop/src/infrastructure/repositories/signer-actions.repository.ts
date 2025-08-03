// src/infrastructure/models/signerAction.model.ts
import mongoose, { Schema, Document } from "mongoose";

interface ISignerAction extends Document {
  userId: string;
  documentId: string;
  signerEmail: string;
  signerName: string;
  action: string;
  status: string;
  timestamp: Date;
}

const SignerActionSchema = new Schema(
  {
    userId: { type: String, required: true },
    documentId: { type: String, required: true },
    request: { type: Schema.Types.Mixed, required: true },
    action: { type: String, required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SignerActionModel = mongoose.model<ISignerAction>(
  "SignerAction",
  SignerActionSchema
);
