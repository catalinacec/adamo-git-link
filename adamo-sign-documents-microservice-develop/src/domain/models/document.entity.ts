import { File } from "buffer";
import { Participant } from "./participant.entity";

export interface BlockChainData {
  contractId: string | null;
  transactionId: string | null;
  hash: string | null;
  registeredAt: Date | null;
  status: "pending" | "success" | "failed";
  attempts: number;
}

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
      hash: string;
      versions: Array<{
        url: string;
        filename: string;
        s3Key: string;
        signedAt: Date | null;
      }>;
    },
    public status: EDocumentStatus,
    public isActive: boolean = true,
    public isDeleted: boolean = false,
    public isRecycler: boolean = false,
    public isBlockchainRegistered: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public blockchain: BlockChainData | null = null,
    public options: IOptions = {
      allowReject: true,
      remindEvery3Days: false,
    }
  ) {}
}

export enum EDocumentStatus {
  DRAFT = "draft",
  SENT = "sent",
  SIGNER = "signer",
  SIGNED = "signed",
  RECYCLER = "recycler",
  DELETED = "deleted",
  IN_PROGRESS = "in_progress",
  REJECTED = "rejected",
  PENDING_SIGNATURE = "pending_signature",
  COMPLETED = "completed",
  ARCHIVED = "archived",
  EXPIRED = "expired",
  CANCELED = "canceled",
  ERROR = "error",
  WAITING_TO_BE_SENT = "waiting_to_be_sent",
  WAITING_FOR_SIGNATURE = "waiting_for_signature",
  WAITING_FOR_APPROVAL = "waiting_for_approval",
  APPROVED = "approved",
  REJECTED_BY_OWNER = "rejected_by_owner",
  PARTIALLY_SIGNED = "partially_signed",
}

export enum EParticipantStatus {
  WAITING_TO_BE_SENT = "waiting_to_be_sent",
  PENDING = "pending",
  SIGNED = "signed",
  REJECTED = "rejected",
  APPROVED = "approved",
}

export interface SignSignerDTO {
  signId: string;
  signatureType: "text" | "image";
  signatureFile?: any;
  signatureText?: string;
  signatureFontFamily?: string;
  signatureColor?: string;
  canvasHeight?: number;
  canvasWidth?: number;
}

export interface IOptions {
  allowReject?: boolean;
  remindEvery3Days?: boolean;
}
