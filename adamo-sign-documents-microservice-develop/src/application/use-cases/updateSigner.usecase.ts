import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";

export class UpdateSignerUseCase {
  constructor(private documentsRepository: DocumentsRepository) {}

  async execute(
    userId: string,
    documentId: string,
    signerId: string,
    signerData: any
  ): Promise<any> {
    const response = await this.documentsRepository.updateSigner(
      userId,
      documentId,
      signerId,
      signerData
    );

    return response;
  }
}
