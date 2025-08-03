// src/application/use-cases/registerDocument.usecase.ts
import { IDocumentsRepository } from "../../domain/repositories/IDocumentsRepository";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import {
  Document,
  EDocumentStatus,
  EParticipantStatus,
  SignSignerDTO,
} from "../../domain/models/document.entity";
import {
  getPartialUploadDocumentSchema,
  getUploadDocumentSchema,
} from "../../validators/uploadDocument.validator";
import { Participant } from "../../domain/models/participant.entity";
import { S3Service } from "../services/s3.service";
import { v4 as uuidv4 } from "uuid";
import { quickValidateFile } from "../../utils/extendedFileValidator";
import { GenerateSigningLinkUseCase } from "./generateSigningLink.usecase";
import {
  sendDocumentSignAssignmentEmail,
  sendSignDocumentConfirmEmail,
} from "../services/email.service";
import { HttpError } from "../../utils/httpError";
import { formatYupErrors } from "../../utils/formatYupErrors";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { RabbitMQService } from "../services/rabbitmq.service";
import { SigningLinkModel } from "../../infrastructure/repositories/signin-link.repository";
import { getSignSignerDocumentSchema } from "../../validators/signSignerDocument.validator";
import { formatYupSignaturesErrors } from "../../utils/formatYupSignaturesErrors";
import { PdfSignService } from "../services/pdfSign.service";
import {
  BlockchainService,
  SendTransactionResult,
} from "../services/blockchain.service";
import { delay } from "../../utils/delay";
import { EAdamoIdStatus } from "../services/adamo-id.service";

export class SignDocumentOwnerUseCase {
  private s3 = new S3Service();
  private pdfSigner = new PdfSignService(this.s3);
  private blockchainService = new BlockchainService();

  constructor(
    private repo: IDocumentsRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(
    userId: string,
    documentId: string,
    signerId: string,
    signatures: SignSignerDTO[],
    ip: string | undefined,
    userAgent: string | undefined,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<any> {
    console.log("Executing SignDocumentOwnerUseCase...");
    if (!userId) {
      console.log("User ID is required");
      throw new HttpError(400, "user", "not_found");
    }

    console.log("User ID:", userId);
    try {
      const schema = getSignSignerDocumentSchema(t);
      console.log("Validating signatures with schema...");
      try {
        await schema.validate({ signatures }, { abortEarly: false });
      } catch (err: any) {
        if (err.name === "ValidationError" && Array.isArray(err.errors)) {
          const formattedErrors = formatYupSignaturesErrors(err.inner, t);
          throw new HttpError(
            400,
            t("errors.document.missing_parameters"),
            undefined,
            undefined,
            formattedErrors
          );
        }
        throw err;
      }
    } catch (err: any) {
      if (err.name === "ValidationError") {
        throw {
          status: {
            code: "error",
            message: t("validation.failed") || "Validation failed",
          },
          data: null,
          message: err.errors,
          timestamp: new Date().toISOString(),
          errors: err.errors.map((e: string) => e),
        };
      }
      throw err;
    }
    console.log("Signatures validated successfully");

    const document = await this.repo.findLatestVersionByDocId(documentId);

    if (document && document.owner !== userId) {
      console.log("Document owner does not match user ID");
      throw new HttpError(400, "custom.owner_sign_notfound");
    }

    const own = await this.userRepo.findById(userId);
    console.log("Owner user found:", own);

    const part = document?.participants.filter((p) => p.email == own?.email);

    if (!part) {
      throw new HttpError(400, "user", "not_found");
    }

    const participant = await this.repo.getSignerById(part[0].uuid);
    // console.log("participant => ", participant);

    // 1.1. Validar si el participante tiene validaciones pendientes
    if (
      participant &&
      participant.requireValidation &&
      participant.statusValidation !== EAdamoIdStatus.COMPLETED
    ) {
      throw new HttpError(400, t("custom.participant_validation_pending"));
    }

    if (participant && participant.status === EParticipantStatus.REJECTED) {
      throw new HttpError(400, t("custom.participant_rejected"));
    }

    // console.log("participant => ", participant);
    if (participant && participant.status === EParticipantStatus.SIGNED) {
      throw new HttpError(400, t("custom.participant_already_signed"));
    }

    console.log(
      "participant?.signatures.length  => ",
      participant?.signatures.length
    );
    console.log("signatures.length  => ", signatures.length);
    if (participant && signatures.length < participant?.signatures.length) {
      throw new HttpError(400, t("custom.signatures_incomplete"));
    }

    if (
      document?.status == EDocumentStatus.DRAFT ||
      document?.status == EDocumentStatus.REJECTED
    ) {
      throw new HttpError(400, t("custom.document_not_in_progress"));
    }
    // console.log("document => ", document);

    // Actualizar el participante con un log de versiones de firmas
    // Por cada signature recibida, guardar en participant.metadata_versions (o como lo llames)
    // un objeto con signId y la data relevante (puedes ajustar los campos según tu necesidad)
    // Asegurarse que cada signature tenga su propio arreglo de metadata_versions
    if (
      participant &&
      participant.signatures &&
      Array.isArray(participant.signatures)
    ) {
      console.log("Updating participant signatures...");
      let pendingSignatures = participant.signatures.length;
      for (const signature of signatures) {
        // Buscar la signature correspondiente en participant.signatures
        const participantSignature = participant.signatures.find(
          (sig: any) => sig.id === signature.signId
        );
        if (participantSignature) {
          if (!participantSignature.metadata_versions) {
            participantSignature.metadata_versions = [];
          }

          let signUrl = "";
          let docName = "";
          let s3key = "";
          if (signature?.signatureType == "image" && signature.signatureFile) {
            const { signedUrl, key, documentName } =
              await this.s3.uploadAndGetPublicUrl(
                signature.signatureFile,
                "signatures"
              );
            signUrl = signedUrl;
            docName = documentName;
            s3key = key;
          }

          participant.historySignatures.hasSigned = true;
          participant.historySignatures.signedAt = new Date();
          participant.historySignatures.ip = ip || "";
          participant.historySignatures.userAgent = userAgent || "";

          console.log(
            "Adding metadata version for signature:",
            signature.signId
          );
          participantSignature.metadata_versions.push({
            signatureType: signature.signatureType || "text",
            signature: signUrl || "",
            signatureName: docName || "",
            signatureS3Key: s3key ?? "",
            signatureText: signature?.signatureText || "",
            signatureFontFamily: signature?.signatureFontFamily || "",
            createdAt: new Date(),
            updatedAt: new Date(),
            isValid: true,
            isActive: true,
            isDeleted: false,
          });
          pendingSignatures -= 1;
        }
        console.log("Pending signatures left:", pendingSignatures);

        if (pendingSignatures <= 0) {
          participant.status = EParticipantStatus.SIGNED;
        }
      }

      const res = await this.repo.updateParticipant(
        documentId,
        participant.uuid,
        participant
      );

      // console.log(
      //   "Updated participant signatures metadata versions:",
      //   participant.signatures
      // );
      // 5) Firmar el PDF en S3
      console.log("Firmando preSignPDF 00");

      const signItems = participant.signatures.map((sig) => {
        console.log(
          "MetadataVersion: ",
          sig.metadata_versions[sig.metadata_versions.length - 1]
        );

        return {
          id: sig.id,
          top: sig.top,
          left: sig.left,
          width: sig.width || 100,
          height: sig.height || 50,
          slideElement: sig.slideElement || "",
          slideIndex: sig.slideIndex || 0,
          signatureFontFamily:
            sig.metadata_versions[sig.metadata_versions.length - 1]
              .signatureFontFamily || "Arial",
          signatureType:
            sig.metadata_versions[sig.metadata_versions.length - 1]
              .signatureType || "text",
          signatureText:
            sig.metadata_versions[sig.metadata_versions.length - 1]
              .signatureText || "",
          signatureColor:
            sig.metadata_versions[sig.metadata_versions.length - 1]
              .signatureColor || "0,0,0",
          rotation: sig.rotation || 0,
          color: sig.color || "#000000",
          imageKey:
            sig.metadata_versions[sig.metadata_versions.length - 1]
              .signatureS3Key ?? "",
          text:
            sig.metadata_versions && sig.metadata_versions.length > 0
              ? sig.metadata_versions[sig.metadata_versions.length - 1]
                  .signatureText
              : "",
          font:
            sig.metadata_versions && sig.metadata_versions.length > 0
              ? sig.metadata_versions[sig.metadata_versions.length - 1]
                  .signatureFontFamily
              : "",
          token: participant.uuid,
          canvasHeight:
            sig.metadata_versions && sig.metadata_versions.length > 0
              ? sig.metadata_versions[sig.metadata_versions.length - 1]
                  .canvasHeight ?? 0
              : 0,
          canvasWidth:
            sig.metadata_versions && sig.metadata_versions.length > 0
              ? sig.metadata_versions[sig.metadata_versions.length - 1]
                  .canvasWidth ?? 0
              : 0,
        };
      });
      console.log("CanvasHeigt:", signItems[0].canvasHeight);
      console.log("CanvasWidth:", signItems[0].canvasWidth);
      const originalKey = document?.metadata.s3Key;

      if (!document) {
        throw new HttpError(404, t("custom.document_not_found"));
      }

      let keyDocName = "";
      console.log("document.metadata.versions => ", document.metadata.versions);
      if (document.metadata.versions.length > 0) {
        console.log(
          "document.metadata.versions[-1] => ",
          document.metadata.versions[document.metadata.versions.length - 1]
        );
        keyDocName =
          document.metadata.versions[document.metadata.versions.length - 1]
            .filename || "";
      } else {
        console.log("document.metadata.s3Key => ", document.metadata.s3Key);
        keyDocName = document.metadata.s3Key || "";
      }

      console.log("Firmando preSignPDF 01");
      const { signedUrl, s3FinalKey, documentName } =
        await this.pdfSigner.signPdf(document, keyDocName || "", signItems);

      console.log("Firmando preSignPDF 02");
      if (!document.metadata.versions) {
        document.metadata.versions = [];
      }
      console.log("Firmando preSignPDF 03");

      // await this.repo.updateDocumentMetadata(documentId, document.metadata);
      await this.repo.addDocumentVersionMetadata(
        documentId,
        signedUrl,
        s3FinalKey,
        documentName,
        ""
      );
      console.log("Firmando preSignPDF 04");

      console.log("Signed Pre PDF URL:", {
        signedUrl,
        s3FinalKey,
        documentName,
      });

      const preDocument = await this.repo.findLatestVersionByDocId(documentId);

      const documentParticipants = preDocument?.participants || [];
      const pendingParticipants = documentParticipants.filter(
        (p: Participant) => p.status === EParticipantStatus.PENDING
      );
      console.log("Firmando preSignPDF 05");

      const signedParticipants = preDocument?.participants.filter(
        (p: Participant) => p.status === EParticipantStatus.SIGNED
      );

      console.log("Firmando preSignPDF 06");

      console.log("Firmando preSignPDF 07");

      let hashFinalPDF = "";
      if (
        preDocument &&
        signedParticipants?.length == documentParticipants.length
      ) {
        console.log("Firmando hashSignPDF 01");

        await RabbitMQService.publishInitSignatureRecord(documentId);
      }

      const userOwner = await this.userRepo.findById(document.owner || "");

      for (const pendingParticipant of pendingParticipants) {
        await sendDocumentSignAssignmentEmail(
          pendingParticipant.email, // email
          {
            profile_image:
              userOwner?.profileImageUrl ??
              "https://dev-sign.adamoservices.co/_next/static/emails-template-images/no_profile_pic.png", // profile_image
            sign_name_requester: participant?.first_name || "", // sign_name_requester
            guest_name: pendingParticipant.first_name, // guest_name
            document_name: document?.filename || "Documento", // document_name
            document_link: "", // document_link
          },
          t
        );
      }

      // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      // 3. Descargar PDF desde S3 y generar SHA256
      // // 4. Llamar a BlockchainService con hasta 3 reintentos
      let bcResult: SendTransactionResult | undefined;
      const network = this.blockchainService.network || "default-network";
      const maxRetries = 3;
      const retryDelayMs = 2000;
      // -----------------------------------------------------
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        // 5.1 Insertar log de ATTEMPT
        try {
          bcResult = await this.blockchainService.sendTransaction(hashFinalPDF);
          // console.log(`Intento ${attempt} => `, bcResult);

          // console.log(`BlockchainService OK en intento ${attempt}:`, bcResult);
          break; // salió bien, rompo el bucle
        } catch (err: any) {
          const msg = err.message || err.toString();
          // console.log(`Intento ${attempt} fallido`);

          if (attempt < maxRetries) {
            // console.log(
            //   `Intento ${attempt} falló (“${msg}”), reintentando en ${retryDelayMs}ms…`
            // );
            await delay(retryDelayMs);
            continue; // siguiente intento
          } else {
            // Ya hice el tercer intento y sigue fallando
            // console.log(
            //   `No se pudo conectar a BlockchainService tras ${maxRetries} intentos:`,
            //   msg
            // );
            throw new HttpError(
              500,
              t("custom.blockchain_service_unavailable")
            );
            return;
          }
        }
      }

      if (!bcResult) {
        console.log("No se obtuvo resultado de BlockchainService");
        return;
      }

      // 5. Actualizar BD con metadata de blockchain

      // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

      const finalDoc = await this.repo.findLatestVersionByDocId(documentId);

      const doc = await this.repo.updateBlockchainData(finalDoc!._id, {
        contractId: bcResult.contractId,
        transactionId: bcResult.transactionId,
        hash: hashFinalPDF,
        registeredAt: bcResult.timestamp,
        status: "success",
        attempts: (document.blockchain?.attempts ?? 0) + 1,
      });

      const fDoc = await this.repo.findLatestVersionByDocId(documentId);

      fDoc?.participants.map((p: Participant) => {
        if (p.email) {
          const [local, domain] = p.email.split("@");
          const maskedLocal =
            local.length > 2
              ? local.slice(0, 2) + "*".repeat(local.length - 2)
              : local[0] + "*";
          p.email = `${maskedLocal}@${domain}`;
        }
      });

      return finalDoc;
    } else {
      throw new HttpError(400, t("custom.document_not_in_progress"));
    }
  }
}
