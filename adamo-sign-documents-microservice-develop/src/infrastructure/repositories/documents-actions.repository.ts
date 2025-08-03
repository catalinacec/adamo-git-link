import mongoose, { Schema, Document } from "mongoose";

interface IDocumentAction extends Document {
  documentId: string;
  userId: string;
  request: any;
  action: string;
  status: string;
  timestamp: Date;
}

const DocumentActionSchema = new Schema(
  {
    documentId: { type: String, required: true },
    userId: { type: String, required: true },
    request: { type: Schema.Types.Mixed, required: true },
    action: { type: String, required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const DocumentActionModel = mongoose.model<IDocumentAction>(
  "DocumentAction",
  DocumentActionSchema
);
