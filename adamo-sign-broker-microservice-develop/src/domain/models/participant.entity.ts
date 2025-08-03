import { EParticipantStatus } from "./document.entity";
import { Signature } from "./signature.entity";

export class Participant {
  constructor(
    public uuid: string = "",
    public first_name: string,
    public last_name: string,
    public email: string,
    public order: number = 1,
    public requireValidation: boolean = false,
    public typeValidation: (
      | "selfie"
      | "identity_document_photo"
      | "identity_validation"
      | "facial"
      | "phone"
      | "email"
      | "document"
      | "none"
    )[] = [],
    public isActive: boolean = true,
    public status: EParticipantStatus = EParticipantStatus.PENDING,
    public signatures: Signature[],
    public historySignatures: HistorySignature,
    public signerLink?: string
  ) {
    this.order = typeof order === "number" && !isNaN(order) ? order : 1;
  }
}

export interface HistorySignature {
  hasSigned: boolean;
  hasRejected: boolean;
  rejectionReason?: string;
  signatureType?: "image" | "text";
  signatureImageUrl?: string;
  signatureText?: string;
  signatureFontFamily?: string;
  canSign: boolean;
  signedAt?: Date;
  rejectedAt?: Date;
  ip: string;
  userAgent: string;
  auditLog?: ActionsSigner[];
}

export interface ActionsSigner {
  action: "signed" | "rejected" | "pending";
  timestamp: Date;
  reason?: string;
}
