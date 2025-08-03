import axiosInstance from "../axiosInstance";
import { GeneralResponse } from "../types/GeneralTypes";
import {
  DocumentSignatureResponse,
  signatureParams,
} from "../types/SignDocumentOwnerType";

class SignDocumentOwnerRepository {
  async signDocument({
    documentId,
    signerId,
    signId,
    signature,
    signatureType,
    signatureText,
    signatureFontFamily,
    signal,
  }: signatureParams & { signal?: AbortSignal }): Promise<
    GeneralResponse<DocumentSignatureResponse>
  > {
    const formData = new FormData();
    formData.append("signatures[0].signId", signId);
    if (signature) {
      formData.append("signatures[0].signature", signature);
    }
    formData.append("signatures[0].signatureType", signatureType);
    if (signatureText) {
      formData.append("signatures[0].signatureText", signatureText);
    }
    if (signatureFontFamily) {
      formData.append("signatures[0].signatureFontFamily", signatureFontFamily);
    }   

    const res = await axiosInstance.post<
      GeneralResponse<DocumentSignatureResponse>
    >(`/documents/${documentId}/sign/${signerId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal,
    });

    return res.data;
  }
}

export default new SignDocumentOwnerRepository();
