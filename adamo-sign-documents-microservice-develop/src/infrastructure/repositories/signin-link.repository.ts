// src/infrastructure/models/signingLink.model.ts
import { Schema, model, Document } from "mongoose";

interface SigningLinkDoc extends Document {
  token: string;
  documentId: string;
  signerId: string;
  expiresAt: Date;
  used: boolean;
}

const SigningLinkSchema = new Schema<SigningLinkDoc>(
  {
    token: { type: String, required: true, unique: true },
    documentId: { type: String, required: true, index: true },
    signerId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SigningLinkModel = model<SigningLinkDoc>(
  "SigningLink",
  SigningLinkSchema
);
