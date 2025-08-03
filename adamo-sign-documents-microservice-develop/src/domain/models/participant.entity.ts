import { EParticipantStatus } from "./document.entity";
import { Signature } from "./signature.entity";

export class Participant {
  constructor(
    public uuid: string = "",
    public first_name: string,
    public last_name: string,
    public email: string,
    public phone: string | null = null,
    public order: number = 1,
    public requireValidation: boolean = false,
    public typeValidation: EParticipantValidation[] = [],
    public dataValidation: Record<string, any> = {},
    public urlValidation: string | null = null,
    public statusValidation: string | null = null,
    public followValidId: string = "",
    public typeNotification: ETypeNotification = ETypeNotification.EMAIL,
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

export enum EParticipantValidation {
  SELFIE = "selfie",
  IDENTITY_DOCUMENT_PHOTO = "identity_document_photo",
  IDENTITY_VALIDATION = "identity_validation",
  FACIAL = "facial",
  PHONE = "phone",
  EMAIL = "email",
  DOCUMENT = "document",
  NONE = "none",
}

export enum ETypeNotification {
  EMAIL = "email",
  WHATSAPP = "whatsapp",
  TELEGRAM = "telegram",
}
