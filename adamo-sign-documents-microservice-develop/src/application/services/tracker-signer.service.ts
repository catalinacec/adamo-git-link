// src/application/services/tracker.service.ts

import { SignerActionModel } from "../../infrastructure/repositories/signer-actions.repository";

export class TrackerSignerService {
  async trackAction({
    userId,
    documentId,
    request,
    action,
    status,
  }: {
    userId: string;
    documentId: string;
    request: any;
    action:
      | "viewed"
      | "signed"
      | "rejected"
      | "validated"
      | "added"
      | "removed"
      | "updated"
      | "deleted";
    status: "pending" | "signed" | "rejected" | "removed";
  }) {
    const newAction = new SignerActionModel({
      userId,
      documentId,
      request,
      action,
      status,
      timestamp: new Date(),
    });

    await newAction.save();
    return newAction;
  }

  async getActions(documentId: string) {
    return await SignerActionModel.find({ documentId }).sort({ timestamp: -1 });
  }
}
