// src/infrastructure/repositories/documents.repository.ts
import mongoose, { Schema, model, Document as MongooseDoc } from "mongoose";
import { IDocumentsRepository } from "../../domain/repositories/IDocumentsRepository";
import {
  Document as DocumentEntity,
  EDocumentStatus,
  EParticipantStatus,
} from "../../domain/models/document.entity";
import {
  EParticipantValidation,
  ETypeNotification,
  Participant,
} from "../../domain/models/participant.entity";
import { S3Service } from "../../application/services/s3.service";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { PaginatedResult } from "../../application/use-cases/listDocuments.usecase";

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
        canvasHeight: { type: Number, required: false },
        canvasWidth: { type: Number, required: false },
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
    phone: { type: String, default: null },
    order: { type: Number, required: true, default: 1 },
    requireValidation: { type: Boolean, default: false },
    dataValidation: {
      type: Object,
      default: {},
    },
    urlValidation: { type: String, default: null },
    statusValidation: { type: String, default: null },
    followValidId: { type: String, default: null },
    typeNotification: {
      type: String,
      enum: ETypeNotification,
      default: ETypeNotification.EMAIL,
    },
    typeValidation: {
      type: [String],
      enum: EParticipantValidation,
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

  async save(doc: DocumentEntity): Promise<DocumentEntity> {
    const m = new DocumentModel({
      documentId: doc.documentId,
      filename: doc.filename,
      owner: doc.owner,
      version: doc.version,
      participants: doc.participants,
      metadata: doc.metadata,
      status: doc.status,
      options: doc.options,
    });

    await m.save();
    return this.map(m);
  }

  async findAll(
    userId: string,
    page: number,
    limit: number,
    filters: any
  ): Promise<any> {
    const query: any = { owner: userId };

    // Aplicar filtros
    if (filters.status) {
      query.status = filters.status;
    }

    // Paginación y conteo total
    const total = await DocumentModel.countDocuments(query);
    const documents = await DocumentModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const mappedDocuments = await Promise.all(
      documents.map((m) => this.map(m))
    );

    return {
      data: mappedDocuments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<DocumentEntity> {
    const m = await DocumentModel.findById(id).exec();
    if (!m) {
      throw new Error("Document not found");
    }
    return await this.map(m);
  }

  async findByDocumentId(
    userId: string,
    documentId: string
  ): Promise<DocumentEntity> {
    const m = await DocumentModel.findOne({ documentId, owner: userId }).exec();
    if (!m) {
      throw new Error("Document not found");
    }
    return await this.map(m);
  }

  async findAllVersions(documentId: string): Promise<DocumentEntity[]> {
    const docs = await DocumentModel.find({ documentId })
      .sort({ version: -1 })
      .exec();
    if (!docs || docs.length === 0) {
      throw new Error("No versions found for this document");
    }
    return Promise.all(docs.map((m) => this.map(m)));
  }

  async update(
    id: string,
    data: Partial<DocumentEntity>
  ): Promise<DocumentEntity | null> {
    const m = await DocumentModel.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();
    return m ? this.map(m) : null;
  }

  async deleteById(id: string): Promise<void> {
    await DocumentModel.findByIdAndDelete(id).exec();
  }

  async deleteDocument(): Promise<void> {
    await DocumentModel.findById(0).exec();
  }

  async getAllDocuments(userId: string): Promise<any> {
    const documents = await DocumentModel.find({ owner: userId }).exec();
    return Promise.all(documents.map((m) => this.map(m)));
  }

  async listDocuments(
    userId: string,
    page: number,
    limit: number,
    filters: Record<string, any>
  ): Promise<{
    data: DocumentEntity[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    // sólo filtro por owner antes de agrupar
    const baseMatch = { owner: userId };

    // 1. pipeline para datos
    const pipeline: any[] = [
      { $match: baseMatch },

      // agrupo la última versión de cada documentId
      { $sort: { documentId: 1, version: -1 } },
      {
        $group: {
          _id: "$documentId",
          document: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$document" } },

      // c) excluyo las versiones cuyo status sea DELETED
      { $match: { status: { $ne: EDocumentStatus.DELETED } } },
      // 2. ahora sí aplico los filtros sobre el documento ya reducido
      //    (elimino claves undefined en filters)
      ...(Object.keys(filters).length
        ? [
            {
              $match: Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v != null)
              ),
            },
          ]
        : []),

      // 3. orden por fecha de creación, paginación
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    // lanzo ambas agregaciones en paralelo: datos y conteo
    const [docsRaw, countResult] = await Promise.all([
      DocumentModel.aggregate(pipeline),
      DocumentModel.aggregate([
        { $match: baseMatch },
        { $sort: { documentId: 1, version: -1 } },
        {
          $group: {
            _id: "$documentId",
            document: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$document" } },
        { $match: { status: { $ne: EDocumentStatus.DELETED } } },
        ...(Object.keys(filters).length
          ? [
              {
                $match: Object.fromEntries(
                  Object.entries(filters).filter(([_, v]) => v != null)
                ),
              },
            ]
          : []),
        { $count: "total" },
      ]),
    ]);

    const data = await Promise.all(docsRaw.map((m) => this.map(m)));
    const total = countResult[0]?.total ?? 0;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retorna todas las últimas versiones con status IN_PROGRESS
   * donde haya un participante con email = `participantEmail`
   * y status = PENDING, paginadas.
   */
  async listLastPendingDocumentsByLatestVersion(
    participantEmail: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<DocumentEntity>> {
    // 1) Pipeline común hasta el filtro de participante
    const basePipeline: any[] = [
      // ordenar para agrupar la última versión
      { $sort: { documentId: 1, version: -1 } },
      // agrupar y quedarnos con la última
      {
        $group: {
          _id: "$documentId",
          document: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$document" } },
      // solo IN_PROGRESS
      { $match: { status: EDocumentStatus.IN_PROGRESS } },
      // solo si el participante está en PENDING
      {
        $match: {
          participants: {
            $elemMatch: {
              email: participantEmail,
              status: EParticipantStatus.PENDING.toLowerCase(),
            },
          },
        },
      },
    ];

    // 2) Pipeline para datos (añade orden, skip, limit)
    const dataPipeline = [
      ...basePipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    // 3) Pipeline para conteo total (reusa basePipeline + $count)
    const countPipeline = [...basePipeline, { $count: "total" }];

    // 4) Ejecutar en paralelo
    const [docsRaw, countResult] = await Promise.all([
      DocumentModel.aggregate(dataPipeline),
      DocumentModel.aggregate(countPipeline),
    ]);

    // 5) Mapear a tu entidad de dominio
    const data = await Promise.all(docsRaw.map((m) => this.map(m)));

    // 6) Construir paginación
    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: { total, page, limit, totalPages },
    };
  }

  /**
   * Clona el documento actual, actualiza los datos y guarda un nuevo documento con una nueva versión.
   */
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

    console.log("******** NEW VERSION CREATED ********:", newDocument._id);
    return this.map(newDocument);
  }

  async addSigners(
    userId: string,
    documentId: string,
    participants: Participant[]
  ): Promise<DocumentEntity | null> {
    const document = await DocumentModel.findOne({
      documentId,
      owner: userId,
    })
      .sort({ version: -1 }) // Ordenar por versión descendente
      .exec();

    if (!document) {
      throw new Error("Document not found or access denied");
    }

    // Actualizamos los participantes en el documento actual
    document.participants.push(...participants);

    // Clonamos el documento y creamos una nueva versión
    return this.createNewVersion(document);
  }

  async updateSigner(
    userId: string,
    documentId: string,
    signerId: string,
    signerData: any
  ): Promise<any> {
    console.log("updateSigner");
    const document = await DocumentModel.findOne({
      documentId,
      owner: userId,
    })
      .sort({ version: -1 }) // Ordenar por versión descendente
      .exec();

    console.log("document OK");
    if (!document) {
      throw new Error("Document not found or access denied");
    }

    console.log("document.participants OK: ", document.participants);
    const index = document.participants.findIndex(
      (p: any) => p.uuid === signerId
    );

    console.log("index", index);
    if (index === -1) {
      throw new Error("Signer not found.");
    }

    console.log("Signer found at index", index);
    // Actualizamos los datos del signer
    document.participants[index] = {
      uuid: document.participants[index].uuid,
      email: document.participants[index].email,
      first_name: document.participants[index].first_name,
      last_name: document.participants[index].last_name,
      status: document.participants[index].status,
      signatures: document.participants[index].signatures,
      statusValidation: document.participants[index].statusValidation,
      historySignatures: document.participants[index].historySignatures,
      ...document.participants[index],
      ...signerData,
    };

    console.log("Actualizando signer en todas las versiones");
    // Clonamos el documento y creamos una nueva versión
    return this.createNewVersion(document);
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

  async updateSignerBySignerId(
    signerId: string,
    documentId: string,
    signerData: any
  ): Promise<any> {
    console.log("updateSignerBySignerId");
    const document = await DocumentModel.findOne({
      documentId,
    })
      .sort({ version: -1 })
      .exec();

    console.log("document OK");
    if (!document) {
      console.log("Document not found or access denied");
      throw new Error("Document not ound or access denied");
    }

    console.log("document.participants OK");

    // Buscamos al participante dentro del documento
    const index = document.participants.findIndex(
      (p: any) => p.uuid === signerId
    );

    if (index === -1) {
      throw new Error("Signer not found.");
    }

    // Actualizamos los datos del signer
    document.participants[index] = {
      uuid: document.participants[index].uuid,
      email: document.participants[index].email,
      first_name: document.participants[index].first_name,
      last_name: document.participants[index].last_name,
      status: document.participants[index].status,
      signatures: document.participants[index].signatures,
      ...document.participants[index],
      ...signerData,
    };

    // Actualizar en todas las versiones donde el participante exista
    await DocumentModel.updateMany(
      {
        documentId,
        "participants.uuid": signerId,
      },
      {
        $set: {
          "participants.$[elem].status": EParticipantStatus.REJECTED,
          "participants.$[elem].historySignatures.hasRejected": true,
          "participants.$[elem].historySignatures.rejectionReason":
            signerData?.historySignatures?.rejectionReason || "Rechazado",
          "participants.$[elem].historySignatures.rejectedAt": new Date(),
        },
        $push: {
          "participants.$[elem].historySignatures.auditLog": {
            action: "rejected",
            timestamp: new Date(),
            reason: `Rechazado en la versión ${document.version}`,
          },
        },
      },
      {
        arrayFilters: [{ "elem.uuid": signerId }],
        multi: true,
      }
    );

    // Clonamos el documento y creamos una nueva versión
    return this.createNewVersion(document);
  }

  async deleteSigner(
    userId: string,
    documentId: string,
    signerId: string
  ): Promise<void> {
    const document = await DocumentModel.findOne({
      documentId,
      owner: userId,
    })
      .sort({ version: -1 }) // Ordenar por versión descendente
      .exec();

    if (!document) {
      throw new Error("Document not found or access denied");
    }

    document.participants = document.participants.filter(
      (p: any) => p.uuid !== signerId
    );

    return this.createNewVersion(document);
  }

  async getSignerById(signerId: string): Promise<Participant | null> {
    // Busca el documento que contiene al signer con ese uuid en cualquier versión
    const doc = await DocumentModel.findOne({ "participants.uuid": signerId })
      .sort({ version: -1 })
      .lean()
      .exec();

    if (!doc) return null;

    // Busca el participante dentro del array
    const signer = doc.participants.find((p: any) => p.uuid === signerId);
    return signer ? (signer as Participant) : null;
  }

  async findDocVersionById(
    userId: string,
    documentId: string,
    versionId: string
  ): Promise<DocumentEntity | null> {
    const doc = await DocumentModel.findOne({
      owner: userId,
      documentId,
      _id: new mongoose.Types.ObjectId(versionId),
    }).exec();
    return doc ? this.map(doc) : null;
  }

  async findLatestVersionBySigner(
    documentId: string
  ): Promise<DocumentEntity | null> {
    const doc = await DocumentModel.findOne({ documentId })
      .sort({ version: -1 })
      .exec();
    return doc ? this.map(doc) : null;
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

  async getAllLatestDocuments(): Promise<DocumentEntity[]> {
    // Obtener la última versión de cada documento (sin filtrar por usuario)
    const docs = await DocumentModel.aggregate([
      { $sort: { documentId: 1, version: -1 } },
      {
        $group: {
          _id: "$documentId",
          document: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$document" } },
    ]);

    return Promise.all(docs.map((m: any) => this.map(m)));
  }

  async findLatestVersionByDocId(
    documentId: string
  ): Promise<DocumentEntity | null> {
    const doc = await DocumentModel.findOne({ documentId })
      .sort({ version: -1 })
      .exec();
    return doc ? this.map(doc) : null;
  }

  async updateMany(filter: any, update: any): Promise<any> {
    return DocumentModel.updateMany(filter, update).exec();
  }

  async getSigners(documentId: string): Promise<Participant[]> {
    const doc = await DocumentModel.findOne({ documentId })
      .sort({ version: -1 })
      .lean()
      .exec();

    if (!doc) {
      throw new Error("Document not found");
    }

    return doc.participants as Participant[];
  }

  async listPendingDocuments(
    userId: string,
    page: number,
    limit: number
  ): Promise<any> {
    const query: any = { owner: userId };

    // 🔍 Agregación para obtener solo la última versión de cada documento
    const documents = await DocumentModel.aggregate([
      {
        $match: {
          ...query,
        },
      },
      {
        $sort: {
          version: -1,
          updatedAt: -1,
        },
      },
      {
        $group: {
          _id: "$documentId",
          document: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$document",
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    // 🔄 Mapear los documentos encontrados
    const mappedDocuments = await Promise.all(
      documents.map((m) => this.map(m))
    );

    // 🔄 Contar los documentos (sólo la última versión)
    const total = await DocumentModel.aggregate([
      {
        $match: {
          ...query,
        },
      },
      {
        $group: {
          _id: "$documentId",
        },
      },
      { $count: "total" },
    ]);

    return {
      data: mappedDocuments,
      pagination: {
        total: total.length > 0 ? total[0].total : 0,
        page,
        limit,
        totalPages: Math.ceil((total.length > 0 ? total[0].total : 0) / limit),
      },
    };
  }

  async listDocumentsByParticipant(
    email: string,
    filters: any
  ): Promise<DocumentEntity[]> {
    const query: any = {
      "participants.email": email,
    };

    if (filters.status) {
      query.status = filters.status;
    }

    const documents = await DocumentModel.aggregate([
      {
        $match: {
          ...query,
        },
      },
      {
        $sort: {
          version: -1,
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$documentId",
          document: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$document",
        },
      },
    ]);

    return Promise.all(documents.map((m: any) => this.map(m)));
  }

  async updateBlockchainData(
    id: string,
    data: Partial<{
      contractId: string;
      transactionId: string;
      hash: string;
      registeredAt: Date;
      status: "pending" | "success" | "failed";
      attempts: number;
    }>
  ): Promise<any> {
    const document = await DocumentModel.findById(id).exec();
    if (!document) {
      throw new Error("Document not found");
    }

    const blockchain = {
      contractId: data.contractId || document.blockchain.contractId,
      transactionId: data.transactionId || document.blockchain.transactionId,
      hash: data.hash || document.blockchain.hash,
      registeredAt: data.registeredAt || document.blockchain.registeredAt,
      status: data.status || document.blockchain.status,
      attempts:
        data.attempts !== undefined
          ? data.attempts
          : document.blockchain.attempts + 1,
    };

    const plain = document.toObject();
    plain._id = undefined;
    plain.isBlockchainRegistered = true;
    plain.blockchain = blockchain;

    return await this.createNewVersion(plain);
  }

  async getObjectBufferFromS3(key: string): Promise<Buffer> {
    const response = await this.s3.client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
      })
    );

    const streamBody = response.Body as Readable;
    const chunks: Uint8Array[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      streamBody.on("data", (chunk: Uint8Array) => {
        chunks.push(chunk);
      });
      streamBody.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      streamBody.on("error", (err) => {
        reject(err);
      });
    });
  }

  async updateParticipantSignaturesMetadataVersions(
    documentId: string,
    signerId: string,
    signatures: any[]
  ): Promise<void> {
    // 1. Traer la última versión del documento
    const document = await DocumentModel.findOne({ documentId })
      .sort({ version: -1 })
      .exec();

    if (!document) {
      throw new Error("Document not found");
    }

    // 2. Buscar el participante y actualizar sus firmas
    const participantIndex = document.participants.findIndex(
      (p: any) => p.uuid === signerId
    );
    if (participantIndex === -1) {
      throw new Error("Participant not found");
    }
    document.participants[participantIndex].signatures = signatures;

    // 3. Clonar el documento y crear una nueva versión
    await this.createNewVersion(document);
  }
  async updateParticipant(
    documentId: string,
    signerId: string,
    participant: Participant
  ): Promise<DocumentEntity> {
    // Buscar la última versión del documento
    const document = await DocumentModel.findOne({ documentId })
      .sort({ version: -1 })
      .exec();

    if (!document) {
      throw new Error("Document not found");
    }

    // Buscar el índice del participante
    const index = document.participants.findIndex(
      (p: any) => p.uuid === signerId
    );
    if (index === -1) {
      throw new Error("Participant not found");
    }

    // Actualizar el participante
    document.participants[index] = participant;

    // Clonar el documento y crear una nueva versión
    return this.createNewVersion(document);
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

  async findByMetadataHash(hash: string): Promise<DocumentEntity | null> {
    const doc = await DocumentModel.findOne({ "metadata.hash": hash })
      .sort({ version: -1 })
      .exec();
    return doc ? this.map(doc) : null;
  }

  async findByMetadataHashBlockchain(
    hash: string
  ): Promise<DocumentEntity | null> {
    const doc = await DocumentModel.findOne({ "blockchain.hash": hash })
      .sort({ version: -1 })
      .exec();
    return doc ? this.map(doc) : null;
  }

  async updateAllParticipants(
    documentId: string,
    participants: Participant[]
  ): Promise<DocumentEntity> {
    const document = await DocumentModel.findOne({ documentId })
      .sort({ version: -1 })
      .exec();

    if (!document) {
      throw new Error("Document not found");
    }

    document.participants = participants;

    return this.createNewVersion(document);
  }
}
