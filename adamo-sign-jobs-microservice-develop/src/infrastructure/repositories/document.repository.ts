// src/infrastructure/repositories/documents.repository.ts
import mongoose, { Schema, model, Document as MongooseDoc } from "mongoose";
import {
  Document as DocumentEntity,
  EDocumentStatus,
  EParticipantStatus,
} from "../../domain/models/document.entity";
import { Participant } from "../../domain/models/participant.entity";
import { IDocumentsRepository } from "../../domain/repositories/IDocumentRepository";

interface DocumentDoc extends MongooseDoc {
  documentId: string;
  filename: string;
  owner: string;
  version: number;
  participants: any[];
  metadata: any;
  status: string;
  isActive: boolean;
  isRecycler: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SignatureSubSchema = new Schema({
  id: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  recipientsName: { type: String, required: true },
  signatureText: { type: String, required: true },
  signatureContentFixed: { type: Boolean, required: true },
  signatureDelete: { type: Boolean, required: true },
  signatureIsEdit: { type: Boolean, required: true },
  slideElement: { type: String, required: true },
  slideIndex: { type: Number, required: true },
  top: { type: Number, required: true },
  left: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  rotation: { type: Number, required: true },
  color: { type: String, required: true },
});

const ParticipantSubSchema = new Schema(
  {
    uuid: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    order: { type: Number, required: true, default: 1 },
    requireValidation: { type: Boolean, default: false },
    typeValidation: {
      type: [String],
      enum: [
        "selfie",
        "identity_document_photo",
        "identity_validation",
        "facial",
        "phone",
        "email",
        "none",
      ],
      default: ["none"],
    },
    status: {
      type: String,
      enum: Object.values(EParticipantStatus),
      default: EParticipantStatus.PENDING,
    },
    signatures: { type: [SignatureSubSchema], default: [] },
    historySignatures: {
      hasSigned: { type: Boolean, default: false },
      hasRejected: { type: Boolean, default: false },
      rejectionReason: { type: String, default: null },
      signatureType: { type: String, default: null },
      signatureImageUrl: { type: String, default: null },
      signatureText: { type: String, default: null },
      signatureFontFamily: { type: String, default: null },
      canSign: { type: Boolean, default: true },
      signedAt: { type: Date, default: null },
      rejectedAt: { type: Date, default: null },
      auditLog: [
        {
          action: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
          reason: { type: String, default: null },
        },
      ],
    },
  },
  { _id: true }
);

const DocumentSchema = new Schema(
  {
    documentId: { type: String, required: true },
    filename: { type: String, required: true },
    owner: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
    participants: { type: [ParticipantSubSchema], default: [] },
    metadata: {
      size: { type: Number, required: true },
      mimetype: { type: String, required: true },
      url: { type: String, required: true },
      filename: { type: String, required: true },
      s3Key: { type: String, required: true },
    },
    status: {
      type: String,
      enum: EDocumentStatus,
      default: "draft",
    },
    isActive: { type: Boolean, default: true },
    isRecycler: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 3) Creamos el modelo usando la interfaz correcta:
export const DocumentModel = model<DocumentDoc>("Document", DocumentSchema);

export class DocumentsRepository implements IDocumentsRepository {
  private async map(m: DocumentDoc): Promise<DocumentEntity> {
    // m._id es un ObjectId real, TS sabe que existe toString()
    return new DocumentEntity(
      (m._id as mongoose.Types.ObjectId).toString(),
      m.documentId,
      m.filename,
      m.owner,
      m.version,
      m.participants as Participant[],
      m.metadata,
      m.status as any,
      m.isActive,
      m.isDeleted,
      m.isRecycler,
      m.createdAt,
      m.updatedAt
    );
  }

  public async createNewVersion(document: any): Promise<any> {
    const newVersion = document.version + 1;
    const newDocument = new DocumentModel({
      ...document,
      documentId: document.documentId,
      filename: document.filename,
      owner: document.owner,
      version: newVersion,
      participants: document.participants,
      metadata: document.metadata,
      status: document.status,
    });

    // Guardar en MongoDB
    await newDocument.save();

    return this.map(newDocument);
  }

  async findLatestVersion(
    userId: string,
    documentId: string
  ): Promise<DocumentEntity | null> {
    const doc = await DocumentModel.findOne({ documentId, owner: userId })
      .sort({ version: -1 })
      .exec();
    return doc ? this.map(doc) : null;
  }

  async findLatestVersionByDocId(
    documentId: string
  ): Promise<DocumentEntity | null> {
    const doc = await DocumentModel.findOne({ documentId })
      .sort({ version: -1 })
      .exec();
    return doc ? this.map(doc) : null;
  }

  public async softDeleteDocument(
    documentId: string,
    userId: string
  ): Promise<void> {
    // Traer la última versión del documento
    const latestDoc = await DocumentModel.findOne({ documentId, owner: userId })
      .sort({ version: -1 })
      .exec();

    if (!latestDoc) return;

    const updatedDoc = {
      ...latestDoc.toObject(),
      _id: undefined,
      isDeleted: true,
      isActive: false,
      isRecycler: false,
      status: EDocumentStatus.DELETED,
      updatedAt: new Date(),
    };

    await this.createNewVersion(updatedDoc);
  }
}
