// src/infrastructure/repositories/documents.repository.ts
import mongoose, { Schema, model, Document as MongooseDoc } from "mongoose";
import {
  Document as DocumentEntity,
  EDocumentStatus,
  EParticipantStatus,
} from "../../domain/models/document.entity";
import { Participant } from "../../domain/models/participant.entity";
import { IDocumentsRepository } from "../../domain/repositories/IDocumentRepository";
import { S3Service } from "../../application/services/s3.service";

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
  isBlockchainRegistered: boolean;
  createdAt: Date;
  updatedAt: Date;
  blockchain: any;
  options: {
    allowReject: boolean;
    remindEvery3Days: boolean;
  };
}

const BlockchainSubSchema = new Schema(
  {
    contractId: { type: String, default: null },
    transactionId: { type: String, default: null },
    hash: { type: String, default: null },
    registeredAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    attempts: { type: Number, default: 0 },
  },
  { _id: false }
);

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
  metadata_versions: {
    type: [
      {
        createdAt: { type: Date, default: Date.now },
        signatureType: { type: String, required: true },
        signature: { type: String, required: false },
        signatureName: { type: String, required: false },
        signatureS3Key: { type: String, required: false },
        signatureText: { type: String, required: false },
        signatureFontFamily: { type: String, required: false },
        signatureColor: { type: String, required: false },
        isValid: { type: Boolean, required: true, default: true },
        isActive: { type: Boolean, required: true, default: true },
        isDeleted: { type: Boolean, required: true, default: false },
      },
    ],
    default: [],
  },
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
        "document",
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
      ip: { type: String, default: null },
      userAgent: { type: String, default: null },
      auditLog: [
        {
          action: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
          reason: { type: String, default: null },
        },
      ],
    },
    signerLink: { type: String, default: null },
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
      hash: { type: String, default: null },
      versions: [
        {
          url: { type: String, required: true },
          filename: { type: String, required: true },
          s3Key: { type: String, required: true },
          signedAt: { type: Date, default: null },
        },
      ],
    },
    status: {
      type: String,
      enum: EDocumentStatus,
      default: "draft",
    },
    isActive: { type: Boolean, default: true },
    isRecycler: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlockchainRegistered: { type: Boolean, default: false },
    blockchain: { type: BlockchainSubSchema, default: () => ({}) },
    options: {
      allowReject: { type: Boolean, default: true },
      remindEvery3Days: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// 3) Creamos el modelo usando la interfaz correcta:
export const DocumentModel = model<DocumentDoc>("Document", DocumentSchema);

export class DocumentsRepository implements IDocumentsRepository {
  private s3 = new S3Service();

  private async map(m: DocumentDoc): Promise<DocumentEntity> {
    // 1️⃣ Obtenemos el s3Key del metadata`
    const s3Key = m.metadata.s3Key;

    // 2️⃣ Regeneramos el link con una URL firmada
    const presignedUrl = await this.s3.getPresignedUrl(s3Key);

    // 3️⃣ Asignamos el valor regenerado al objeto
    m.metadata.url = presignedUrl;

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
      m.isBlockchainRegistered,
      m.createdAt,
      m.updatedAt,
      {
        contractId: m.blockchain?.contractId ?? null,
        transactionId: m.blockchain?.transactionId ?? null,
        hash: m.blockchain?.hash ?? null,
        registeredAt: m.blockchain?.registeredAt ?? null,
        status: (m.blockchain?.status as any) ?? "pending",
        attempts: m.blockchain?.attempts ?? 0,
      },
      {
        allowReject: m.options?.allowReject ?? true,
        remindEvery3Days: m.options?.remindEvery3Days ?? false,
      }
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

  async findLatestVersionByDocIdAndOwner(
    documentId: string,
    owner: string
  ): Promise<DocumentEntity | null> {
    const doc = await DocumentModel.findOne({ documentId, owner })
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
      isDeleted: false,
      isActive: false,
      isRecycler: true,
      status: EDocumentStatus.RECYCLER,
      updatedAt: new Date(),
    };

    await this.createNewVersion(updatedDoc);
  }

  public async softDeletePermanentlyDocument(
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

  public async softRestoreDocument(
    documentId: string,
    userId: string
  ): Promise<void> {
    // 1) Coge la última versión (p.ej. la v10)
    const latest = await DocumentModel.findOne({ documentId, owner: userId })
      .sort({ version: -1 })
      .exec();

    if (!latest || latest.version < 2) {
      // o no existe documento, o sólo hay versión 1
      return;
    }

    // 2) Coge la versión anterior (p.ej. la v9)
    const prevVersionNumber = latest.version - 1;
    const toRestore = await DocumentModel.findOne({
      documentId,
      owner: userId,
      version: prevVersionNumber,
    }).exec();

    if (!toRestore) {
      throw new Error(`No existe la versión ${prevVersionNumber}`);
    }

    // 3) Prepara el objeto copiando todos los campos de la v9,
    const restoredData = {
      ...toRestore.toObject(),
      _id: undefined,
      version: latest.version,
      isDeleted: false,
      isActive: true,
      isRecycler: false,
      updatedAt: new Date(),
    };

    // 4) Llama a tu helper para crear la nueva versión
    await this.createNewVersion(restoredData);
  }

  async addDocumentVersionMetadata(
    documentId: string,
    finalSignedUrl: string,
    finalDocName: string,
    finalS3Key: string,
    hash?: string
  ): Promise<void> {
    const document = await DocumentModel.findOne({ documentId })
      .sort({ version: -1 })
      .exec();

    if (!document) {
      throw new Error("Document not found");
    }

    if (!document.metadata.versions) {
      document.metadata.versions = [];
    }
    document.metadata.hash = hash;

    document.metadata.versions.push({
      url: finalSignedUrl,
      filename: finalDocName,
      s3Key: finalS3Key,
      signedAt: new Date(),
    });

    await this.createNewVersion(document);
  }

  async updateDocumentStatus(
    documentId: string,
    status: string
  ): Promise<DocumentEntity | null> {
    const document = await DocumentModel.findOne({ documentId })
      .sort({ version: -1 })
      .exec();

    if (!document) {
      throw new Error("Document not found");
    }

    document.status = status;

    return this.createNewVersion(document);
  }
}
