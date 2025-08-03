// src/application/use-cases/registerDocument.usecase.ts
import { IDocumentsRepository } from "../../domain/repositories/IDocumentsRepository";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import {
  Document,
  EDocumentStatus,
  IOptions,
} from "../../domain/models/document.entity";
import {
  getPartialUploadDocumentSchema,
  getUploadDocumentSchema,
} from "../../validators/uploadDocument.validator";
import {
  ETypeNotification,
  Participant,
} from "../../domain/models/participant.entity";
import { S3Service } from "../../application/services/s3.service";
import { v4 as uuidv4 } from "uuid";
import { quickValidateFile } from "../../utils/extendedFileValidator";
import { GenerateSigningLinkUseCase } from "./generateSigningLink.usecase";
import { sendDocumentSignAssignmentEmail } from "../services/email.service";
import { HttpError } from "../../utils/httpError";
import { formatYupErrors } from "../../utils/formatYupErrors";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { AdamoIdService } from "../services/adamo-id.service";
import { WhatsAppService } from "../services/whatsapp.service";
import { User } from "../../domain/models/user.entity";
import { NotificationRepository } from "../../infrastructure/repositories/notification.repository";
import { TelegramService } from "../services/telegram.service";

export class RegisterDocumentUseCase {
  private s3 = new S3Service();

  constructor(
    private repo: IDocumentsRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(
    file: Express.Multer.File,
    filename: string,
    owner: string,
    participants: Participant[],
    status: string,
    options: IOptions,
    token: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<Document> {
    console.time("🕒 ValidationYup");
    try {
      if (status == "draft") {
        const schema = getPartialUploadDocumentSchema(t);
        try {
          await schema.validate(
            { file, filename, owner, status, participants },
            { abortEarly: false }
          );
        } catch (err: any) {
          if (err.name === "ValidationError" && Array.isArray(err.errors)) {
            const formattedErrors = formatYupErrors(err.inner, t);
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
      } else {
        const schema = getUploadDocumentSchema(t);
        try {
          await schema.validate(
            { file, filename, owner, status, participants },
            { abortEarly: false }
          );
        } catch (err: any) {
          if (err.name === "ValidationError" && Array.isArray(err.errors)) {
            const formattedErrors = formatYupErrors(err.inner, t);
            throw {
              data: null,
              message: err.errors,
              timestamp: new Date().toISOString(),
              errors: err.errors.map((e: string) => e),
            };
          }

          throw err;
        }
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
    console.timeEnd("🕒 ValidationYup");

    // Validación (PDF & DOCX)
    console.time("🕒 validateFileExtended");
    await quickValidateFile(file);
    console.timeEnd("🕒 validateFileExtended");

    console.time("🕒 S3.uploadAndGetPublicUrl");
    const { signedUrl, key, documentName } =
      await this.s3.uploadAndGetPublicUrl(file, "documents");
    console.timeEnd("🕒 S3.uploadAndGetPublicUrl");

    if (typeof options === "string") {
      try {
        options = JSON.parse(options);

        // Por si viene doblemente serializado (caso común en multipart + frontend)
        if (typeof options === "string") {
          options = JSON.parse(options);
        }
      } catch (e) {
        throw new HttpError(400, "Invalid JSON string in 'options'");
      }
    }

    const documentId = uuidv4();
    const document = new Document(
      "",
      documentId,
      filename,
      owner,
      1, // version, siempre en 1 porque recien se crea
      participants,
      {
        size: file.size,
        mimetype: file.mimetype,
        url: signedUrl,
        filename: documentName,
        s3Key: key,
        hash: "", // hash, se calcula en el repositorio cuando se completa el firmado
        versions: [],
      },
      status as EDocumentStatus,
      true, // isActive,
      false, // isDeleted,
      false, // isRecycler
      false, // isBlockchainRegistered
      new Date(), // createdAt
      new Date(), // updatedAt
      null, // blockchain
      {
        allowReject: options?.allowReject || false,
        remindEvery3Days: options?.remindEvery3Days || false,
      } // options
    );

    console.time("🕒 Repo.save");
    const savedDocument = await this.repo.save(document);
    console.timeEnd("🕒 Repo.save");

    const upDoc = await this.repo.findLatestVersionByDocId(
      savedDocument.documentId
    );
    console.log("upDoc document 01:", upDoc?._id);

    if (status === "sent") {
      console.time("🕒 Loop-participants (emails + DB)");
      const users = await this.userRepo.findAllActive();
      for (const participant of participants) {
        console.time("  🕒 GenLink y updateDocumentStatus");
        const docRepo = new DocumentsRepository();
        const generateSigningLinkUseCase = new GenerateSigningLinkUseCase(
          docRepo
        );

        console.log("Participant UUID :", participant.uuid);
        const { url } = await generateSigningLinkUseCase.execute(
          upDoc!.documentId,
          participant.uuid
        );
        participant.signerLink = url;

        // 3. Registrar en AdamoID AL FINAL
        if (participant.requireValidation) {
          const { urlValidation, followValidId, statusValidation } =
            await AdamoIdService.getDataFollowAdamoService(
              upDoc!,
              participant,
              token
            );

          participant.urlValidation = urlValidation ?? "";
          participant.followValidId = followValidId ?? "";
          participant.statusValidation = statusValidation ?? "";
        }

        // 4. Actualizar estado
        await this.repo.updateDocumentStatus(documentId, "in_progress");

        console.timeEnd("  🕒 GenLink y updateDocumentStatus");

        console.log(
          "Users => ",
          users.map((u) => u.email)
        );
        await this.notifyParticipantByTypeNotification(
          upDoc!,
          participant,
          users,
          t
        );
      }

      upDoc!.participants = participants;
      await this.repo.updateAllParticipants(upDoc!.documentId, participants);
      console.timeEnd("🕒 Loop-participants (emails + DB)");
    }

    const finalDoc = await this.repo.findLatestVersionByDocId(
      upDoc!.documentId
    );
    console.log("Final document after registration:", finalDoc?._id);

    if (!finalDoc) {
      throw new HttpError(404, t("errors.document.not_found"));
    }

    return finalDoc;
  }

  async notifyParticipantByTypeNotification(
    document: Document,
    participant: Participant,
    users: User[],
    t: (key: string, vars?: Record<string, any>) => string
  ) {
    console.log(
      "Users received:",
      users.map((u) => u.email)
    );
    const notiRepo = new NotificationRepository();
    console.log("Notifying participant:", participant.email);

    const matchedUser = users.filter((u) => u.email === participant.email);
    console.log("Matched user:", matchedUser);
    if (matchedUser.length > 0) {
      const notification = {
        user: matchedUser[0]._id ?? "",
        type: "signed_participant",
        data: {
          title: t("custom.assigned_to_sign"),
          message: `Has sido asignado a firmar el documento: ${document.filename}`,
          metadata: {
            enabledRead: true,
            typeRead: "new_document",
            documentId: document.documentId,
            participantId: participant.uuid,
            documentName: document.filename,
            participantName: participant.first_name,
            link: document.metadata.url,
          },
        },
        createdAt: new Date(),
      };
      await notiRepo.create(notification);

      console.log(
        `Participant email ${participant.email} belongs to user: ${matchedUser[0].name} (${matchedUser[0]._id})`
      );
    }

    switch (participant.typeNotification) {
      case ETypeNotification.EMAIL:
        {
          console.log("Notifying via Email:", participant.first_name);
          const userOwner = await this.userRepo.findByUUID(
            document?.owner || ""
          );
          await sendDocumentSignAssignmentEmail(
            participant.email, // email
            {
              profile_image:
                userOwner?.profileImageUrl ??
                "https://dev-sign.adamoservices.co/_next/static/emails-template-images/no_profile_pic.png", // profile_image
              sign_name_requester: userOwner?.name || "", // sign_name_requester
              guest_name: participant.first_name, // guest_name
              document_name: document?.filename || "Documento", // document_name
              document_link: participant.signerLink ?? "", // document_link
            },
            t
          );
          console.timeEnd("  🕒 sendDocumentSignAssignmentEmail");
        }
        break;
      case ETypeNotification.WHATSAPP:
        {
          console.log(
            `Notifying via WhatsApp a ${participant.first_name} : `,
            participant.phone
          );
          await WhatsAppService.sendWhatsAppMessage(
            participant.phone!,
            participant.signerLink?.split("=")[1] ?? ""
          );
        }
        break;
      case ETypeNotification.TELEGRAM:
        {
          console.log(
            `Notifying via Telegram a ${participant.first_name} : `,
            participant.phone
          );
          await TelegramService.sendTelegramMessage(
            participant.phone!,
            participant.signerLink?.split("=")[1] ?? ""
          );
        }
        break;
      default:
        throw new Error("Unknown notification type");
    }
    console.log("Notification sent successfully");
  }
}
