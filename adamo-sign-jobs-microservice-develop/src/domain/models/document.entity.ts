import { Participant } from "./participant.entity";

export class Document {
  constructor(
    public _id: string,
    public documentId: string,
    public filename: string,
    public owner: string,
    public version: number = 1,
    public participants: Participant[],
    public metadata: {
      size: number;
      mimetype: string;
      url: string;
      filename: string;
      s3Key: string;
    },
    public status: EDocumentStatus,
    public isActive: boolean = true,
    public isDeleted: boolean = false,
    public isRecycler: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}

export enum EDocumentStatus {
  DRAFT = "draft",
  SENT = "sent",
  SIGNER = "signer",
  RECYCLER = "recycler",
  DELETED = "deleted",
  IN_PROGRESS = "in_progress",
  REJECTED = "rejected",
  PENDING_SIGNATURE = "pending_signature",
}

export enum EParticipantStatus {
  WAITING_TO_BE_SENT = "waiting_to_be_sent",
  PENDING = "pending",
  SIGNED = "signer",
  REJECTED = "rejected",
}
