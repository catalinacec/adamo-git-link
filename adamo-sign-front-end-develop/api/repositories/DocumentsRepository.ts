import axiosInstance from "../axiosInstance";
import {
  DocumentsListResponse,
  ListDocumentsParams,
  TokenData,
  newDocumentRequest,
} from "../types/DocumentsTypes";
import { GeneralResponse } from "../types/GeneralTypes";

class DocumentsRepository {
  async listDocuments({
    page = 1,
    limit = 20,
    status = "",
    signal,
  }: ListDocumentsParams): Promise<GeneralResponse<DocumentsListResponse[]>> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (status) {
      params["filter[status]"] = status;
    }

    const response = await axiosInstance.get<
      GeneralResponse<DocumentsListResponse[]>
    >("/documents", {
      params,
      signal,
    });

    return response.data;
  }

  async getPendingSignatureDocuments(
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse[]>> {
    const response = await axiosInstance.get<
      GeneralResponse<DocumentsListResponse[]>
    >(`/documents/pending-signature`, {
      signal,
    });
    return response.data;
  }

  async newDocument(
    data: newDocumentRequest,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    const formdata = new FormData();
    formdata.append("participants", JSON.stringify(data.participians));
    formdata.append("filename", data.filename);
    formdata.append("status", data.status);
    formdata.append("options", JSON.stringify(data.options || {}));
    const pdfFile = data.file instanceof File ? data.file : new File([data.file], "document.pdf", { type: "application/pdf" });
    if (!(pdfFile instanceof File)) {
      throw new Error("Invalid file");
    }
    formdata.append("file", pdfFile);

    const response = await axiosInstance.post<
      GeneralResponse<DocumentsListResponse>
    >("/documents", formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal,
    });

    return response.data;
  }

  async getTokenSignature(
    documentId: string,
    signatureId: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<TokenData>> {
    const response = await axiosInstance.post<GeneralResponse<TokenData>>(
      `/documents/${documentId}/signers/${signatureId}/link`,
      { signal },
    );
    return response.data;
  }

  async deleteDocument(
    id: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    const response = await axiosInstance.delete<
      GeneralResponse<DocumentsListResponse>
    >(`/documents/${id}`, { signal });
    return response.data;
  }

  async getDocumentById(
    id: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    const response = await axiosInstance.get<
      GeneralResponse<DocumentsListResponse>
    >(`/documents/${id}`, { signal });
    return response.data;
  }

  async bulkDeleteDocument(
    ids: { ids: string[] },
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<DocumentsListResponse>
    >(`/documents/bulk-delete`, ids, { signal });
    return response.data;
  }

  async restoreDocument(
    documentId: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<DocumentsListResponse>
    >(`/documents/${documentId}/restore`, { documentId }, { signal });
    return response.data;
  }

  async registerBlockchain(
    documentId: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<DocumentsListResponse>
    >(`/documents/${documentId}/register-blockchain`, {  }, { signal });
    return response.data;
  }

  async notifyParticipants(
    documentId: string,
    signerId: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<DocumentsListResponse>> {
    const response = await axiosInstance.post<
      GeneralResponse<DocumentsListResponse>
    >(`/documents/${documentId}/signer/${signerId}/notify`, {}, { signal });
    return response.data;
  }
}

export default new DocumentsRepository();
