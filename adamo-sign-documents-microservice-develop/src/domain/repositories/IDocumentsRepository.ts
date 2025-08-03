import { Document } from "../models/document.entity";
import { Participant } from "../models/participant.entity";

export interface IDocumentsRepository {
  save(doc: Document): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  update(id: string, data: Partial<Document>): Promise<Document | null>;
  deleteById(id: string): Promise<void>;
  updateDocumentStatus(
    documentId: string,
    status: string
  ): Promise<Document | null>;

  findAll(
    userId: string,
    page: number,
    limit: number,
    filters: any
  ): Promise<any>;
  findByDocumentId(userId: string, documentId: string): Promise<Document>;
  findAllVersions(documentId: string): Promise<Document[]>;
  deleteDocument(): Promise<void>;
  listDocuments(
    userId: string,
    page: number,
    limit: number,
    filters: any
  ): Promise<any>;
  createNewVersion(document: any): Promise<any>;
  addSigners(
    userId: string,
    documentId: string,
    participants: Participant[]
  ): Promise<Document | null>;
  updateSigner(
    userId: string,
    documentId: string,
    signerId: string,
    signerData: any
  ): Promise<any>;
  updateSignerBySignerId(
    signerId: string,
    documentId: string,
    signerData: any
  ): Promise<any>;
  deleteSigner(
    userId: string,
    documentId: string,
    signerId: string
  ): Promise<void>;
  getSignerById(signerId: string): Promise<Participant | null>;
  findDocVersionById(
    userId: string,
    documentId: string,
    versionId: string
  ): Promise<Document | null>;
  findLatestVersionBySigner(documentId: string): Promise<Document | null>;
  findLatestVersion(
    userId: string,
    documentId: string
  ): Promise<Document | null>;
  findLatestVersionByDocId(documentId: string): Promise<Document | null>;
  updateMany(filter: any, update: any): Promise<any>;
  getSigners(documentId: string): Promise<Participant[]>;
  listPendingDocuments(
    userId: string,
    page: number,
    limit: number
  ): Promise<any>;
  listDocumentsByParticipant(email: string, filters: any): Promise<Document[]>;
  updateBlockchainData(
    id: string,
    data: Partial<{
      contractId: string;
      transactionId: string;
      hash: string;
      registeredAt: Date;
      status: "pending" | "success" | "failed";
      attempts: number;
    }>
  ): Promise<any>;
  getObjectBufferFromS3(key: string): Promise<Buffer>;
  updateParticipantSignaturesMetadataVersions(
    documentId: string,
    signerId: string,
    signatures: any[]
  ): Promise<void>;
  updateParticipant(
    documentId: string,
    signerId: string,
    participant: Participant
  ): Promise<Document>;
  addDocumentVersionMetadata(
    documentId: string,
    finalSignedUrl: string,
    finalDocName: string,
    finalS3Key: string,
    hash: string
  ): Promise<void>;
  findByMetadataHash(hash: string): Promise<Document | null>;
  updateAllParticipants(
    documentId: string,
    participants: Participant[]
  ): Promise<Document>;
}
