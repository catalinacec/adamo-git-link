import mongoose, { Schema, Document } from "mongoose";

/**
 * Cada vez que el sistema intenta registrar un documento en blockchain,
 * insertamos una entrada en esta colección.
 */
export interface BlockchainInteractionEntry {
  documentId: string; // ID (ObjectId) del documento en nuestra BD
  userId: string; // Quién solicitó la operación
  attemptNumber: number; // 1, 2 o 3 (o más si cambias la lógica)
  action: "attempt" | "success" | "failure";
  timestamp: Date; // Cuándo ocurrió este evento
  hash: string; // SHA256 calculado del PDF
  network: string; // p.ej. "ethereum-goerli"
  contractId?: string; // Sólo si action === "SUCCESS"
  transactionId?: string; // Sólo si action === "SUCCESS"
  errorMessage?: string; // Sólo si action === "FAILURE"
}

interface BlockchainInteractionDoc
  extends BlockchainInteractionEntry,
    Document {}

const BlockchainInteractionSchema = new Schema<BlockchainInteractionDoc>(
  {
    documentId: { type: String, required: true },
    userId: { type: String, required: true },
    attemptNumber: { type: Number, required: true },
    action: {
      type: String,
      enum: ["attempt", "success", "failure"],
      required: true,
    },
    timestamp: { type: Date, default: () => new Date(), required: true },
    hash: { type: String, required: true },
    network: { type: String, required: true },
    contractId: { type: String, default: null },
    transactionId: { type: String, default: null },
    errorMessage: { type: String, default: null },
  },
  { collection: "blockchaininteractions" }
);

export const BlockchainInteractionModel =
  mongoose.model<BlockchainInteractionDoc>(
    "BlockchainInteraction",
    BlockchainInteractionSchema
  );

export class BlockchainInteractionRepository {
  async create(entry: BlockchainInteractionEntry): Promise<void> {
    await BlockchainInteractionModel.create(entry);
  }

  async findByDocumentId(documentId: string) {
    return BlockchainInteractionModel.find({ documentId })
      .sort({ timestamp: 1 })
      .lean()
      .exec();
  }
}
