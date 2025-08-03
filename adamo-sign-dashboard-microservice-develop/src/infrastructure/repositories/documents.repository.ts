import mongoose, { Schema, model, Document as MongooseDoc } from "mongoose";
import { IDocumentsRepository } from "../../domain/repositories/IDocumentRepository";
import {
  EDocumentStatus,
  EParticipantStatus,
} from "../../domain/models/document.entity";

interface DocumentDoc extends MongooseDoc {
  documentId: string;
  filename: string;
  owner: string;
  version: number;
  status: string;
  isActive: boolean;
  isRecycler: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema(
  {
    documentId: { type: String, required: true },
    filename: { type: String, required: true },
    owner: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
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

export const DocumentModel = model<DocumentDoc>("Document", DocumentSchema);

export class DocumentsRepository implements IDocumentsRepository {
  async getStats(user: string): Promise<Record<string, number>> {
    const statuses = [
      EDocumentStatus.IN_PROGRESS,
      EDocumentStatus.REJECTED,
      EDocumentStatus.COMPLETED,
      EDocumentStatus.DRAFT,
      EDocumentStatus.RECYCLER,
    ];

    // 1. Hacemos la agregación
    const stats = await DocumentModel.aggregate([
      { $sort: { documentId: 1, version: -1 } },
      { $match: { owner: user } },
      {
        $group: {
          _id: "$documentId",
          document: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$document" } },
      { $match: { status: { $in: statuses } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 2. Inicializar todos los estados a 0
    const result: Record<string, number> = {};
    for (const status of statuses) {
      result[status] = 0;
    }

    // 3. Rellenar con los contadores reales
    for (const { _id, count } of stats) {
      result[_id] = count;
    }

    return result;
  }

  async getPendingSignature(email: string): Promise<number> {
    // 1) Pipeline común hasta el filtro de participante
    const basePipeline: any[] = [
      { $sort: { documentId: 1, version: -1 } },
      {
        $group: {
          _id: "$documentId",
          document: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$document" } },
      { $match: { status: EDocumentStatus.IN_PROGRESS } },
      {
        $match: {
          participants: {
            $elemMatch: {
              email: email,
              status: EParticipantStatus.PENDING.toLowerCase(),
            },
          },
        },
      },
    ];

    // 2) Pipeline para conteo total (reusa basePipeline + $count)
    const countPipeline = [...basePipeline, { $count: "total" }];

    // 3) Ejecutar en paralelo
    const countResult = await DocumentModel.aggregate(countPipeline);

    const total = countResult[0]?.total ?? 0;

    return total;
  }
}
