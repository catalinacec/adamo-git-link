// src/application/use-cases/generateSigningLink.usecase.ts
import crypto from "crypto";
import { SigningLinkModel } from "../../infrastructure/repositories/signin-link.repository";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import jwt from "jsonwebtoken";

export class GenerateSigningLinkUseCase {
  constructor(private readonly documentRepository: DocumentsRepository) {}

  async execute(
    documentId: string,
    signerId: string
  ): Promise<{ token: string; url: string }> {
    const expiresAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
    const expireWithoutDate = 6 * 30 * 24 * 60 * 60 * 1000;
    const token = jwt.sign(
      {
        id: signerId,
        uuid: signerId,
        sub: signerId,
        aud: process.env.JWT_AUDIENCE,
      },
      (process.env.JWT_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
      {
        algorithm: "RS256",
        keyid: "adamo-sign-key",
        expiresIn: expireWithoutDate,
      }
    );

    console.log(
      "🕒 Generating signing link for document:",
      documentId,
      "and signer:",
      signerId
    );
    await SigningLinkModel.deleteMany({ documentId, signerId });

    await SigningLinkModel.create({ token, documentId, signerId, expiresAt });

    return {
      token: token,
      url: `${process.env.FRONTEND_URL}/documents?data=${token}`,
    };
  }
}
