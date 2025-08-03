export type ParticipantStatus = "pending" | "sent" | "signed" | "rejected";

export interface Signature {
  id: string;
  recipientEmail: string;
  recipientsName: string;
  signatureText?: string;
  signature?: string | File;
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
  _id?: string;
}

export interface Document {
  _id: string;
  documentId: string;
  filename: string;
  owner: string;
  version: number;
  participants: Participant[];
  status: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}