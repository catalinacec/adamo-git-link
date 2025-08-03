// src/application/use-cases/validateSigningLink.usecase.ts
import { SigningLinkModel } from "../../infrastructure/repositories/signin-link.repository";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";

export class ValidateSigningLinkUseCase {
  constructor(private readonly documentRepository: DocumentsRepository) {}

  async execute(token: string) {
    const link = await SigningLinkModel.findOne({ token }).exec();
    if (
      !link ||
      link.used === true ||
      !link.expiresAt ||
      isNaN(new Date(link.expiresAt).getTime()) ||
      new Date(link.expiresAt) < new Date()
    ) {
      return null;
    }

    // const participant = await this.documentRepository.getSignerById(
    //   link.signerId
    // );
    // console.log("link", link);

    const document = await this.documentRepository.findLatestVersionByDocId(
      link.documentId
    );

    return { document, signerId: link.signerId };
  }
}
