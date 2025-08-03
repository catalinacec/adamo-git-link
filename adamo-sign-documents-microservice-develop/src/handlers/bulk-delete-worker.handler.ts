// src/handlers/bulk-delete-worker.handler.ts
import { Handler } from "aws-lambda";
import mongoose from "mongoose";
import { DocumentModel } from "../infrastructure/repositories/documents.repository";

interface MQRecord {
  body: string;
}

interface MQEvent {
  Records: MQRecord[];
}

export const handler: Handler<MQEvent, void> = async (event) => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }

  for (const record of event.Records) {
    const { documentId } = JSON.parse(record.body);
    try {
      await DocumentModel.deleteOne({ _id: documentId });
    } catch (err) {
      // Lanzamos para que Lambda reintente o mande a DLQ
      throw err;
    }
  }
};
