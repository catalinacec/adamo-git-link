// src/application/services/tracker.service.ts

import { DocumentActionModel } from "../../infrastructure/repositories/documents-actions.repository";
import { SignerActionModel } from "../../infrastructure/repositories/signer-actions.repository";

export class TrackerDocumentsService {
  async trackAction({
    documentId,
    userId,
    request,
    action,
    status,
  }: {
    documentId: string;
    userId: string;
    request: any;
    action:
      | "created"
      | "viewed"
      | "signed"
      | "rejected"
      | "validated"
      | "added"
      | "removed"
      | "updated"
      | "deleted"
      | "notify";
    status: "pending" | "signed" | "rejected" | "removed";
  }) {
    const newAction = new DocumentActionModel({
      documentId,
      userId,
      request,
      action,
      status,
      timestamp: new Date(),
    });

    await newAction.save();
    return newAction;
  }

  async getActions(documentId: string) {
    return await DocumentActionModel.find({ documentId }).sort({
      timestamp: -1,
    });
  }
}
