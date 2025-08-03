import DocumentsRepository from "../repositories/DocumentsRepository";
import {
  DocumentsListResponse,
  ListDocumentsParams,
  TokenData,
  newDocumentRequest,
} from "../types/DocumentsTypes";
import { GeneralResponse } from "../types/GeneralTypes";

class DocumentsUseCase {
  async listDocuments({
    page,
    limit,
    status = "",
    signal,
  }: ListDocumentsParams): Promise<GeneralResponse<DocumentsListResponse[]>> {
    const listDocuments: ListDocumentsParams = {
      page: page,
      limit: limit,
      status: status,
      signal: signal,
    };
    return await DocumentsRepository.listDocuments(listDocuments);
  }

  async getPendingSignatureDocuments(
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse[]>> {
    return await DocumentsRepository.getPendingSignatureDocuments(signal);
  }

  async newDocument(
    data: newDocumentRequest,
    signal: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    return await DocumentsRepository.newDocument(data, signal);
  }

  async getTokenSignature(
    documentId: string,
    signatureId: string,
    signal: AbortSignal,
  ): Promise<GeneralResponse<TokenData>> {
    return await DocumentsRepository.getTokenSignature(
      documentId,
      signatureId,
      signal,
    );
  }

  async deleteDocument(
    id: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    return await DocumentsRepository.deleteDocument(id, signal);
  }

  async getDocumentById(
    documentId: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    return await DocumentsRepository.getDocumentById(documentId, signal);
  }

  async bulkDeleteDocument(
    ids: { ids: string[] },
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    return await DocumentsRepository.bulkDeleteDocument(ids, signal);
  }

  async restoreDocument(
    documentId: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    return await DocumentsRepository.restoreDocument(documentId, signal);
  }

  async registerBlockchain(
    documentId: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    return await DocumentsRepository.registerBlockchain(documentId, signal);
  }

  async notifyParticipants(
    documentId: string,
    signerId: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    return await DocumentsRepository.notifyParticipants(
      documentId,
      signerId,
      signal,
    );
  }
}

export default new DocumentsUseCase();
