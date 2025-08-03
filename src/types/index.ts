export type ParticipantStatus = "pending" | "sent" | "signed" | "rejected";

export interface Signature {
  id: string;
  recipientEmail: string;
  recipientsName: string;
  signatureText?: string;
  signature?: string | File;
  signatureType: 'draw' | 'type' | 'upload';
  signatureFontFamily?: string;
  signatureColor?: string;
  signatureContentFixed?: boolean;
  signatureDelete?: boolean;
  signatureIsEdit?: boolean;
  slideElement?: string;
  slideIndex: number;
  top: number;
  left: number;
  width: number;
  height: number;
  rotation?: number;
  color?: string;
  signedAt?: string;
  ip?: string;
  userAgent?: string;
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
  signedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  _id?: string;
}

export interface Document {
  _id: string;
  documentId: string;
  filename: string;
  owner: string;
  version: number;
  participants: Participant[];
  status: 'draft' | 'sent' | 'partial' | 'completed' | 'rejected';
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  totalSignatures: number;
  completedSignatures: number;
  pendingSignatures: number;
}

export interface DocumentStats {
  totalDocuments: number;
  completedDocuments: number;
  pendingSignatures: number;
  rejectedDocuments: number;
  totalContacts: number;
}

export interface SignatureEvent {
  id: string;
  documentId: string;
  participantId: string;
  action: 'signed' | 'rejected' | 'viewed';
  timestamp: string;
  details?: any;
}