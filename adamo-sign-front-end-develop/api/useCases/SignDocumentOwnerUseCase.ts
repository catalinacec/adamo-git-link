import SignDocumentOwnerRepository from "../repositories/SignDocumentOwnerRepository";
import { GeneralResponse } from "../types/GeneralTypes";
import {
  DocumentSignatureResponse,
  signatureParams,
} from "../types/SignDocumentOwnerType";

class SignDocumentOwnerUseCase {
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
    return await SignDocumentOwnerRepository.signDocument({
      documentId,
      signerId,
      signId,
      signature,
      signatureType,
      signatureText,
      signatureFontFamily,
      signal,
    });
  }
}

export default new SignDocumentOwnerUseCase();
