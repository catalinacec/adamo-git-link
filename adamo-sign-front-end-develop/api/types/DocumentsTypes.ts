import { ParticipantStatus } from "@/types";

export interface DocumentsListResponse {
  _id: string;
  documentId: string;
  filename: string;
  owner: string;
  version: number;
  participants: Participant[];
  metadata: Metadata;
  status: string;
  isActive: boolean;
  isDeleted: boolean;
  isRecycler: boolean;
  isBlockchainRegistered: boolean;
  createdAt: string;
  updatedAt: string;
  blockchain: BlockchainInfo;
}

export interface TokenData {
  signatureId: string;
  participantEmail: string;
  participantId?: string | number;
  token: string;
  url: string;
}

export interface Participant {
  uuid?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  typeNotification?: "email" | "whatsapp" | "telegram";
  order?: number;
  requireValidation: boolean;
  typeValidation?: string[];
  status?: ParticipantStatus;
  signatures: Signature[];
  historySignatures?: HistorySignatures;
  _id?: string;
}

export interface Signature {
  id?: string;
  recipientEmail?: string;
  recipientsName?: string;
  signatureText?: string;
  signatureContentFixed?: boolean;
  signatureDelete?: boolean;
  signatureIsEdit?: boolean;
  slideElement?: string;
  slideIndex?: number;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  rotation?: number;
  color?: string;
  _id?: string;
}

export interface AuditLogEntry {
  action: string;
  timestamp: string;
  reason: string;
  _id: string;
}

export interface Metadata {
  size: number;
  mimetype: string;
  url: string;
  filename: string;
  s3Key?: string;
  hash: string;
  versions?: Version[];
}

export interface Version {
  url: string;
  filename: string;
  s3key: string;
  signedAt: string;
  _id: string;
}

export interface HistorySignatures {
  hasSigned: boolean;
  hasRejected: boolean;
  rejectionReason: string;
  signatureType: string;
  signatureImageUrl: string;
  signatureText: string;
  signatureFontFamily: string;
  canSign: boolean;
  signedAt: string | null;
  rejectedAt: string | null;
  auditLog: any[];
}

export interface verifyTokenParams {
  token: string;
  signal?: AbortSignal;
}

export interface BlockchainInfo {
  contractId: string | null;
  transactionId: string | null;
  hash: string | null;
  registeredAt: string | null;
  status: string;
  attempts: number;
}

export interface ListDocumentsParams {
  page?: number;
  limit?: number;
  status?: string;
  signal?: AbortSignal;
}

export interface newDocumentRequest {
  participians: Participant[];
  filename: string;
  status: string;
  options?: {
    allowReject?: boolean;
    remindEvery3Days?: boolean;
  };
  file: File;
}
