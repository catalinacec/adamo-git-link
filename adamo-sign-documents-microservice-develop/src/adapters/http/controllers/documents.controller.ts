import { Request, Response } from "express";
import { RegisterDocumentUseCase } from "../../../application/use-cases/registerDocument.usecase";
import { DocumentsRepository } from "../../../infrastructure/repositories/documents.repository";
import {
  ETypeNotification,
  Participant,
} from "../../../domain/models/participant.entity";
import { Signature } from "../../../domain/models/signature.entity";
import { Pagination } from "../../../domain/models/api-response.model";
import { ListDocumentsUseCase } from "../../../application/use-cases/listDocuments.usecase";
import { v4 as uuidv4 } from "uuid";
import { AddSignerUseCase } from "../../../application/use-cases/addSigner.usecase";
import { UpdateSignerUseCase } from "../../../application/use-cases/updateSigner.usecase";
import { DeleteSignerUseCase } from "../../../application/use-cases/deleteSigner.usecase";
import { TrackerSignerService } from "../../../application/services/tracker-signer.service";
import { TrackerDocumentsService } from "../../../application/services/tracker-documents.service";
import { DeleteDocumentUseCase } from "../../../application/use-cases/deleteDocument.usecase";
import { ListVersionsUseCase } from "../../../application/use-cases/listVersions.usecase";
import { RollbackDocumentUseCase } from "../../../application/use-cases/rollbackDocument.usecase";
import { RestoreDocumentUseCase } from "../../../application/use-cases/restoreDocument.usecase";
import { ChangeStatusUseCase } from "../../../application/use-cases/changeStatus.usecase";
import { RejectedDocumentUseCase } from "../../../application/use-cases/rejectedDocument.usecase";
import { BulkDeleteDocumentsUseCase } from "../../../application/use-cases/bulkDeleteDocuments.usecase";
import { GenerateSigningLinkUseCase } from "../../../application/use-cases/generateSigningLink.usecase";
import { ValidateSigningLinkUseCase } from "../../../application/use-cases/validateSigningLink.usecase";
import { NotifySignerUseCase } from "../../../application/use-cases/notifySigner.usecase";
import { NotifySignersUseCase } from "../../../application/use-cases/notifySigners.usecase";
import { HttpError } from "../../../utils/httpError";
import {
  setPagination,
  setSuccessMessage,
} from "../../../utils/responseHelpers";
import { getErrorMessage } from "../../../utils/setErrorMessage";
import { get } from "http";
import { getI18n, resolveLanguage } from "../../../i18n/i18n";
import { getAddSignerSchema } from "../../../validators/addParticipant.validator";
import { formatYupParticipantErrors } from "../../../utils/formatYupParticipantErrors";
import { UpdateDocumentUseCase } from "../../../application/use-cases/updateDocument.usecase";
import { getRejectDocumentSchema } from "../../../validators/rejectedDocument.validator";
import { ListPendingDocumentsUseCase } from "../../../application/use-cases/listPendingDocuments.usecase";
import {
  EDocumentStatus,
  IOptions,
  SignSignerDTO,
} from "../../../domain/models/document.entity";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { RegisterBlockchainUseCase } from "../../../application/use-cases/registerBlockchain.usecase";
import { BlockchainService } from "../../../application/services/blockchain.service";
import { BulkRestoreDocumentsUseCase } from "../../../application/use-cases/bulkRestoreDocuments.usecase";
import { BulkDeleteDocumentsPermanentlyUseCase } from "../../../application/use-cases/bulkDeleteDocumentsPermanently.usecase";
import { SignDocumentGuessUseCase } from "../../../application/use-cases/signDocumentGuess.usecase";
import { SignRejectedGuessUseCase } from "../../../application/use-cases/signRejectedGuess.usecase";
import { ReSignSignerDocumentUseCase } from "../../../application/use-cases/reSignSignerDocument.usecase";
import { SignDocumentOwnerUseCase } from "../../../application/use-cases/signDocumentOwner.usecase";
import { SignRejectedOwnerUseCase } from "../../../application/use-cases/signRejectedOwner.usecase";
import { VerifySignatureUseCase } from "../../../application/use-cases/verifySignature.usecase";
import { RequestVerifySignatureRepository } from "../../../infrastructure/repositories/request-verify-signature.repository";
import { VerifySignatureDocUseCase } from "../../../application/use-cases/verifySignatureDoc.usecase";
import { CurrentStatusAdamoIdUseCase } from "../../../application/use-cases/currentStatusAdamoId.usecase";
import { UpdatetStatusAdamoIdUseCase } from "../../../application/use-cases/updateStatusAdamoId.usecase";

declare global {
  namespace Express {
    interface Request {
      t: (key: string, vars?: Record<string, any>) => string;
      user?: { id: string; uuid?: string; language?: string };
      token?: string;
      auditIP?: string;
      auditUserAgent?: string;
    }
  }
}

const repo = new DocumentsRepository();
const userRepo = new UserRepository();
const reqVerifyRepo = new RequestVerifySignatureRepository();
const registerDocument = new RegisterDocumentUseCase(repo, userRepo);
const listDocuments = new ListDocumentsUseCase(repo);
const addSigner = new AddSignerUseCase(repo);
const updateSigner = new UpdateSignerUseCase(repo);
const deleteSigner = new DeleteSignerUseCase(repo);
const trackerService = new TrackerSignerService();
const trackerDocument = new TrackerDocumentsService();
const deleteDocumentUseCase = new DeleteDocumentUseCase(repo);
const listVersionsUseCase = new ListVersionsUseCase(repo);
const rollbackDocumentUseCase = new RollbackDocumentUseCase(repo);
const restoreDocumentUseCase = new RestoreDocumentUseCase(repo);
const changeStatusUseCase = new ChangeStatusUseCase(repo);
const rejectedDocumentUseCase = new RejectedDocumentUseCase(repo);
const bulkDeleteUseCase = new BulkDeleteDocumentsUseCase();
const bulkDeletePermanentlyUseCase =
  new BulkDeleteDocumentsPermanentlyUseCase();
const bulkRestoreUseCase = new BulkRestoreDocumentsUseCase();
const generateLinkUseCase = new GenerateSigningLinkUseCase(repo);
const validateSigningLinkUseCase = new ValidateSigningLinkUseCase(repo);
const notifySignerUseCase = new NotifySignerUseCase(repo);
const notifySignersUseCase = new NotifySignersUseCase(repo);
const updateDocumentUseCase = new UpdateDocumentUseCase(repo);
const listPendingDocuments = new ListPendingDocumentsUseCase(repo, userRepo);
const signDocumentGuess = new SignDocumentGuessUseCase(repo, userRepo);
const signRejectedGuess = new SignRejectedGuessUseCase(repo);
const signDocumentOwner = new SignDocumentOwnerUseCase(repo, userRepo);
const signRejectedOwner = new SignRejectedOwnerUseCase(repo);
const reSignSignerDocument = new ReSignSignerDocumentUseCase(repo);
const registerBlockchain = new RegisterBlockchainUseCase(
  repo,
  new BlockchainService()
);
const verifySignatureDocUC = new VerifySignatureDocUseCase(repo, reqVerifyRepo);
const verifySignatureUC = new VerifySignatureUseCase(repo, reqVerifyRepo);
const currentStatusAdamoIdUC = new CurrentStatusAdamoIdUseCase(repo);
const updateStatusAdamoIdUC = new UpdatetStatusAdamoIdUseCase(repo);

export class DocumentsController {
  static async healthCheck(req: Request, res: Response) {
    return res.status(200).json({
      status: "ok",
      message: "Documents service is healthy",
      timestamp: new Date(),
    });
  }

  static async createDocument(req: Request, res: Response) {
    try {
      const userData = {
        ...req.body,
        _id: req.user?.id ?? "",
        uuid: req.user?.uuid ?? "",
      };
      const file = req.file as Express.Multer.File;
      const owner = userData.uuid as string;
      const raw = req.body.participants as string;
      const filename = req.body.filename as string;
      const status = req.body.status as string;
      const options = req.body.options as IOptions;
      const token = req.token;
      const t = req.t;

      const participantsArr: any[] = JSON.parse(raw || "[]");

      const schema = getAddSignerSchema(t);
      try {
        await schema.validate(
          { participants: participantsArr },
          { abortEarly: false }
        );
      } catch (err: any) {
        if (err.name === "ValidationError" && Array.isArray(err.errors)) {
          const formattedErrors = formatYupParticipantErrors(err.inner, t);
          throw new HttpError(
            400,
            t("participant.invalid_summary"),
            undefined,
            undefined,
            formattedErrors
          );
        }

        throw err;
      }

      const participants = participantsArr.map((p) => {
        const signatures = (p.signatures || []).map(
          (s: any) =>
            new Signature(
              uuidv4(),
              s.recipientEmail,
              s.recipientsName,
              s.signatureText,
              s.signatureContentFixed,
              s.signatureDelete,
              s.signatureIsEdit,
              s.slideElement,
              s.slideIndex,
              s.top,
              s.left,
              s.width,
              s.height,
              s.rotation,
              s.color
            )
        );

        return new Participant(
          uuidv4(),
          p.first_name,
          p.last_name,
          p.email,
          p.phone ?? "",
          p.order ?? 1,
          p.requireValidation ?? false,
          p.typeValidation ?? "none",
          p.dataValidation ?? {},
          p.urlValidation ?? null,
          p.statusValidation ?? null,
          p.followValidId ?? "",
          p.typeNotification ?? ETypeNotification.EMAIL,
          p.isActive ?? true,
          p.status,
          signatures,
          p.historySignatures ?? {
            hasSigned: false,
            hasRejected: false,
            rejectionReason: "",
            signatureType: "",
            signatureImageUrl: "",
            signatureText: "",
            signatureFontFamily: "",
            canSign: true,
            signedAt: null,
            rejectedAt: null,
            auditLog: [],
          },
          p.signerLink ?? undefined
        );
      });

      const saved = await registerDocument.execute(
        file,
        filename,
        owner,
        participants,
        status,
        options,
        token ?? "",
        t
      );

      setSuccessMessage(req, res, "document", "create");
      return res.status(201).json(saved);
    } catch (error: any) {
      console.log("Error al crear el documento:", error);
      if (error instanceof HttpError) {
        throw error;
      }

      // Si es un error de validación con estructura conocida
      const isClient =
        /inválido|corrupto|Zip-Slip|cifrado/.test(error.message) ||
        Array.isArray(error.errors);
      const t = req.t;

      const message = isClient
        ? error.message
        : t("common.error", {
            entity: t("entities.document"),
            action: t("infinitive_actions.create"),
          });

      const code = isClient ? 400 : 500;
      const errors = error.errors || [error.message];

      throw new HttpError(code, message, undefined, undefined, errors);
    }
  }

  static async getDocuments(req: Request, res: Response) {
    try {
      // 1. Extraer userId
      const userId = req.user?.uuid ?? "";

      // 2. Parsear page/limit desde query (strings) a números o undefined
      const pageParam = req.query.page as string | undefined;
      const limitParam = req.query.limit as string | undefined;
      const page = pageParam ? parseInt(pageParam, 10) : undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : undefined;

      console.log("query filter:", req.query.filter);
      // 3. Extraer filtros simples (status)
      const statusFilter =
        req.query.filter && (req.query.filter as any).status
          ? ((req.query.filter as any).status as string)
          : undefined;
      const filters: Record<string, any> = {};
      if (statusFilter) filters.status = statusFilter;

      console.log("page controller :", page);
      console.log("limit controller :", limit);
      console.log("filters controller :", filters);
      // 4. Llamar al caso de uso
      const result = await listDocuments.execute(userId, page, limit, filters);

      // 5. Mostrar primeros 5 IDs en consola
      const docsArray = Array.isArray(result) ? result : result.data;
      console.log(
        "[DocumentsController] First 5 document IDs:",
        docsArray.slice(0, 5).map((d: any) => d.id),
        "..."
      );

      // 6. Mensaje de éxito
      setSuccessMessage(req, res, "documents", "retrieve");

      // 7. Si viene paginación, añadir headers y devolver todo el objeto
      if (!Array.isArray(result) && result.pagination) {
        setPagination(
          res,
          new Pagination(
            result.pagination.page,
            result.pagination.totalPages,
            result.pagination.limit,
            result.pagination.total
          )
        );
        return res.status(200).json(result.data);
      }

      // 8. Si no viene paginación, devolver solo el array
      return res.status(200).json(docsArray);
    } catch (error: any) {
      console.log("Error al obtener los documentos:", error);
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "documents", "list");
      throw new HttpError(400, message);
    }
  }

  static async getDocumentById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const document = await repo.findById(id);
      if (!document) {
        const message = getErrorMessage(
          req,
          "resource",
          "not_found",
          req.t("errors.resource.not_found", {
            entity: req.t("entities.document"),
          })
        );

        throw new HttpError(404, message);
      }

      setSuccessMessage(req, res, "documents", "retrieve");
      return res.status(200).json(document);
    } catch (error: any) {
      const message = getErrorMessage(req, "document", "retrieve");
      throw new HttpError(500, message);
    }
  }

  static async updateDocument(req: Request, res: Response) {
    const t = req.t;

    try {
      const file = req.file as Express.Multer.File;
      const { filename } = req.body;
      const documentId = req.params.id;
      const userId = req.user?.id ?? "";

      const updated = await updateDocumentUseCase.execute(
        userId,
        documentId,
        file,
        filename,
        t
      );

      setSuccessMessage(req, res, "documents", "update");
      return res.status(200).json(updated);
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "document", "update");
      throw new HttpError(500, message);
    }
  }

  static async deleteDocument(req: Request, res: Response) {
    try {
      const t = req.t;

      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.params.id;

      const result = await deleteDocumentUseCase.execute(
        userData._id,
        documentId,
        t
      );

      setSuccessMessage(req, res, "document", "delete");
      return res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      console.log("Error al eliminar el documento:", error);
      const message = getErrorMessage(req, "document", "delete");
      throw new HttpError(500, message);
    }
  }

  static async addSigner(req: Request, res: Response) {
    try {
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.params.id;
      const raw = req.body.participants;
      const t = req.t;

      // const participantsArr: Participant[] = JSON.parse(raw || "[]");
      const participantsArr: any[] = Array.isArray(raw) ? raw : [];
      const participants = participantsArr.map((p) => {
        const signatures = (p.signatures || []).map(
          (s: any) =>
            new Signature(
              s.id,
              s.recipientEmail,
              s.recipientsName,
              s.signatureText,
              s.signatureContentFixed,
              s.signatureDelete,
              s.signatureIsEdit,
              s.slideElement,
              s.slideIndex,
              s.top,
              s.left,
              s.width,
              s.height,
              s.rotation,
              s.color
            )
        );

        return new Participant(
          uuidv4(),
          p.first_name,
          p.last_name,
          p.email,
          p.phone ?? "",
          p.order ?? 1,
          p.requireValidation ?? false,
          p.typeValidation ?? "none",
          p.dataValidation ?? {},
          p.urlValidation ?? "",
          p.statusValidation ?? "",
          p.followValidId ?? "",
          p.typeNotification ?? ETypeNotification.EMAIL,
          p.isActive ?? true,
          p.status,
          signatures,
          p.historySignatures ?? {
            hasSigned: false,
            hasRejected: false,
            rejectionReason: "",
            signatureType: "",
            signatureImageUrl: "",
            signatureText: "",
            signatureFontFamily: "",
            canSign: true,
            signedAt: null,
            rejectedAt: null,
            auditLog: [],
          },
          p.signerLink ?? undefined
        );
      });

      const added = await addSigner.execute(
        userData._id,
        documentId,
        participants,
        t
      );

      // 👉 Registramos la acción para cada participante añadido
      await Promise.all(
        participants.map(async (p) => {
          await trackerService.trackAction({
            userId: userData._id,
            documentId,
            request: raw,
            action: "added",
            status: "pending",
          });
        })
      );

      await Promise.all(
        participants.map(async (p) => {
          await trackerDocument.trackAction({
            documentId,
            userId: userData._id,
            request: raw,
            action: "added",
            status: "pending",
          });
        })
      );

      setSuccessMessage(req, res, "signer", "create");
      return res.status(200).json(added);
    } catch (error: any) {
      const message = getErrorMessage(req, "signer", "create");
      throw new HttpError(500, message);
    }
  }

  static async updateSigner(req: Request, res: Response) {
    try {
      // Obtenemos los datos del request
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.params.id;
      const signerId = req.params.signerId;
      const signerData = req.body;

      // Ejecutamos el caso de uso para actualizar el signer
      const updatedSigner = await updateSigner.execute(
        userData._id,
        documentId,
        signerId,
        signerData
      );

      // 👉 Registramos la acción
      await trackerService.trackAction({
        userId: userData._id,
        documentId,
        request: signerData,
        action: "updated",
        status: "pending",
      });

      await trackerDocument.trackAction({
        documentId,
        userId: userData._id,
        request: signerData,
        action: "updated",
        status: "pending",
      });

      // Construimos el response
      setSuccessMessage(req, res, "signer", "update");
      return res.status(200).json(updatedSigner);
    } catch (error: any) {
      const message = getErrorMessage(req, "signer", "update");
      throw new HttpError(500, message);
    }
  }

  static async deleteSigner(req: Request, res: Response) {
    try {
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.params.id;
      const signerId = req.params.signerId;
      const t = req.t;

      // 👉 Obtenemos el email del signer antes de eliminarlo
      const temporalRepo = new DocumentsRepository();
      const signerData = await temporalRepo.getSignerById(signerId);

      if (!signerData) {
        const message = req.t("errors.not_found", {
          entity: req.t("entities.signer"),
        });
        throw new HttpError(404, message);
      }

      await deleteSigner.execute(userData._id, documentId, signerId, t);

      // 👉 Registramos la acción en el tracker
      await trackerService.trackAction({
        userId: userData._id,
        documentId,
        request: { signerId, email: signerData.email },
        action: "deleted",
        status: "removed",
      });

      await trackerDocument.trackAction({
        documentId,
        userId: userData._id,
        request: { signerId, email: signerData.email },
        action: "deleted",
        status: "pending",
      });

      // Construimos el response
      setSuccessMessage(req, res, "signer", "delete");

      return res.status(200).json(null);
    } catch (error: any) {
      const message = getErrorMessage(req, "signer", "delete");
      throw new HttpError(500, message);
    }
  }

  static async listVersionsByDocId(req: Request, res: Response) {
    try {
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.params.id;
      const t = req.t;
      const versions = await listVersionsUseCase.execute(documentId, t);
      // Construimos el response
      setSuccessMessage(req, res, "document", "retrieve");
      return res.status(200).json(versions);
    } catch (error: any) {
      const message = getErrorMessage(req, "document", "retrieve");
      throw new HttpError(500, message);
    }
  }

  static async rollbackDocument(req: Request, res: Response) {
    try {
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.params.id;
      const versionId = req.body.version;
      const t = req.t;

      if (!versionId) {
        const message = req.t("validation.required", {
          field: "versionId",
        });
        throw new HttpError(400, message);
      }

      const newVersion = await rollbackDocumentUseCase.execute(
        userData._id,
        documentId,
        versionId,
        t
      );

      // Construimos el response
      setSuccessMessage(req, res, "document", "rollback");
      return res.status(200).json(newVersion);
    } catch (error: any) {
      const message = getErrorMessage(req, "document", "rollback");
      throw new HttpError(500, message);
    }
  }

  static async restoreDocument(req: Request, res: Response) {
    try {
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.body.documentId;
      const t = req.t;

      if (!documentId) {
        const message = req.t("validation.required", {
          field: "documentId",
        });
        throw new HttpError(400, message);
      }

      const restoreDoc = await restoreDocumentUseCase.execute(
        userData._id,
        documentId,
        t
      );

      setSuccessMessage(req, res, "document", "restore");
      return res.status(200).json(restoreDoc);
    } catch (error: any) {
      const message = getErrorMessage(req, "document", "restore");
      throw new HttpError(500, message);
    }
  }

  static async changeStatus(req: Request, res: Response) {
    try {
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.params.id;
      const t = req.t;

      const { status } = req.body as {
        status: EDocumentStatus;
      };

      if (!status) {
        const message = req.t("validation.required", { field: "status" });
        throw new HttpError(400, message);
      }

      const updated = await changeStatusUseCase.execute(
        userData._id,
        documentId,
        status,
        t
      );

      setSuccessMessage(
        req,
        res,
        "custom",
        "charged_status",
        req.t("custom.changed_status", {
          status: req.t(`statuses.${status}`),
        })
      );
      return res.status(200).json(updated);
    } catch (error: any) {
      const message = getErrorMessage(req, "document", "change_status");
      throw new HttpError(500, message);
    }
  }

  static async rejectDocument(req: Request, res: Response) {
    try {
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.params.id;
      const signer = req.body.signerId;
      const reason = req.body.reason;
      const t = req.t;

      const schema = getRejectDocumentSchema(t);
      try {
        await schema.validate(
          { userId: userData._id, documentId, reason, signerId: signer },
          { abortEarly: false }
        );
      } catch (err: any) {
        if (err.name === "ValidationError" && Array.isArray(err.errors)) {
          const formattedErrors = formatYupParticipantErrors(err.inner, t);
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

      const rejectedDoc = await rejectedDocumentUseCase.execute(
        documentId,
        signer,
        reason,
        req.token ?? "",
        t
      );

      setSuccessMessage(req, res, "document", "reject");
      return res.status(200).json(rejectedDoc);
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "document", "reject");
      throw new HttpError(500, message);
    }
  }

  static async bulkDeleteDocuments(req: Request, res: Response) {
    try {
      const userId = req.user?.id ?? "";
      const ids: string[] = Array.isArray(req.body.ids) ? req.body.ids : [];

      if (ids.length === 0) {
        throw new HttpError(
          400,
          req.t("validation.min_array", { field: "ids", min: 1 })
        );
      }

      const result = await bulkDeleteUseCase.execute(userId, ids);

      setSuccessMessage(req, res, "documents", "delete");
      return res.status(202).json(result);
    } catch (error: any) {
      const message = getErrorMessage(req, "documents", "delete");
      throw new HttpError(500, message);
    }
  }

  static async bulkDeleteDocumentsPermanently(req: Request, res: Response) {
    try {
      const userId = req.user?.id ?? "";
      const ids: string[] = Array.isArray(req.body.ids) ? req.body.ids : [];

      if (ids.length === 0) {
        throw new HttpError(
          400,
          req.t("validation.min_array", { field: "ids", min: 1 })
        );
      }

      const result = await bulkDeletePermanentlyUseCase.execute(userId, ids);

      setSuccessMessage(req, res, "documents", "delete");
      return res.status(202).json(result);
    } catch (error: any) {
      const message = getErrorMessage(req, "documents", "delete");
      throw new HttpError(500, message);
    }
  }

  static async bulkRestoreDocuments(req: Request, res: Response) {
    try {
      const userId = req.user?.id ?? "";
      const ids: string[] = Array.isArray(req.body.ids) ? req.body.ids : [];

      if (ids.length === 0) {
        throw new HttpError(
          400,
          req.t("validation.min_array", { field: "ids", min: 1 })
        );
      }

      const result = await bulkRestoreUseCase.execute(userId, ids);

      setSuccessMessage(req, res, "documents", "restore");
      return res.status(202).json(result);
    } catch (error: any) {
      const message = getErrorMessage(req, "documents", "restore");
      throw new HttpError(500, message);
    }
  }

  static async generateSigningLink(req: Request, res: Response) {
    try {
      const documentId = req.params.id;
      const signerId = req.params.signerId;
      const url = await generateLinkUseCase.execute(documentId, signerId);
      setSuccessMessage(req, res, "link", "generate");
      return res.status(200).json(url);
    } catch (err: any) {
      const message = getErrorMessage(req, "link", "generate");
      throw new HttpError(500, message);
    }
  }

  static async validateSigningLink(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const result = await validateSigningLinkUseCase.execute(token);
      if (!result) {
        const message = getErrorMessage(req, "link", "validate");
        throw new HttpError(500, message);
      }

      setSuccessMessage(req, res, "link", "validate");
      return res.status(200).json(result);
    } catch (error: any) {
      const message = getErrorMessage(req, "link", "validate");
      throw new HttpError(500, message);
    }
  }

  static async notifySigner(req: Request, res: Response) {
    try {
      console.log("Notificando al firmante...");
      const documentId = req.params.documentId;
      console.log("Document ID:", documentId);
      const signerId = req.params.signerId;
      console.log("Signer ID:", signerId);
      const t = req.t;

      await notifySignerUseCase.execute(documentId, signerId, t);

      setSuccessMessage(req, res, "signer", "notify");
      return res.status(200).json({ documentId, signerId });
    } catch (error: any) {
      console.log("Error al notificar al firmante:", error);
      if (error instanceof HttpError) {
        throw error;
      }
      const message = getErrorMessage(req, "signer", "notify");
      throw new HttpError(500, message);
    }
  }

  static async notifySigners(req: Request, res: Response) {
    try {
      const documentId = req.params.id;
      const t = req.t;
      await notifySignersUseCase.execute(documentId, t);

      setSuccessMessage(req, res, "signers", "notify");
      return res.status(200).json({ documentId });
    } catch (error: any) {
      const message = getErrorMessage(req, "signers", "notify");
      throw new HttpError(500, message);
    }
  }

  static async getPendingSignatureDocuments(req: Request, res: Response) {
    try {
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        status: EDocumentStatus.IN_PROGRESS,
      };

      const documents = await listPendingDocuments.execute(
        userData._id,
        page,
        limit,
        filters
      );

      setPagination(
        res,
        new Pagination(
          documents.pagination.page,
          documents.pagination.totalPages,
          documents.pagination.limit,
          documents.pagination.total
        )
      );
      setSuccessMessage(req, res, "documents", "retrieve");
      return res.status(200).json(documents.documents);
    } catch (error: any) {
      const message = getErrorMessage(req, "documents", "retrieve");
      throw new HttpError(400, message);
    }
  }

  static async registerDocumentOnBlockchain(req: Request, res: Response) {
    try {
      const t = req.t;
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const documentId = req.params.id;

      const response = await registerBlockchain.execute(
        documentId,
        userData._id,
        {},
        t
      );

      // console.log("Blockchain registration response:", response);

      setSuccessMessage(req, res, "blockchain", "updated");
      return res.status(200).json(response);
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      console.log("Error al registrar documento en blockchain:", error);
      const message = getErrorMessage(req, "documents", "retrieve");
      throw new HttpError(400, message);
    }
  }

  static async signSignerDocument(req: Request, res: Response) {
    try {
      const token = req.body.token as string;
      const isRejected = req.body.rejected || false;
      const reason = req.body.reason || false;
      const documentId = req.params.id;
      const signerId = req.params.signerId || req.params["id"];
      const ip = req.auditIP || req.ip;
      const userAgent = req.auditUserAgent || req.headers["user-agent"] || "";
      const t = req.t;
      console.log("Signing document with token:", token);
      console.log("Document ID:", documentId);
      console.log("Signer ID:", signerId);
      console.log("Is Rejected:", isRejected);
      console.log("Reason for rejection:", reason);

      if (isRejected) {
        console.log("Processing rejection for signer:", signerId);
        const result = await signRejectedGuess.execute(
          token,
          documentId,
          signerId,
          reason,
          t
        );

        if (!result) {
          const message = getErrorMessage(req, "document", "rejected");
          throw new HttpError(500, message);
        }

        setSuccessMessage(req, res, "document", "rejected");
        return res.status(200).json(null);
      }

      // 2) Recogemos todos los ficheros subidos
      const files = req.files as Express.Multer.File[];

      // 3) Map para ir agrupando por índice
      const map = new Map<number, any>();

      // 4) Recolecta campos TEXT anidados: signatures[0].signatureText, etc.
      for (const [rawKey, rawValue] of Object.entries(req.body)) {
        const m = rawKey.match(/^signatures\[(\d+)\]\.(\w+)$/);
        if (!m) continue;
        const idx = Number(m[1]);
        const prop = m[2]; // 'signatureText' o 'signatureFontFamily'
        if (!map.has(idx)) map.set(idx, {});
        map.get(idx)[prop] = rawValue;
      }

      // 5) Recolecta los FILES: fieldname = 'signatures[0].signature'
      for (const file of files) {
        const m = file.fieldname.match(/^signatures\[(\d+)\]\.signature$/);
        if (!m) continue;
        const idx = Number(m[1]);
        if (!map.has(idx)) map.set(idx, {});
        map.get(idx).signatureFile = file;
      }

      console.log("Collected signatures:", map);
      // 6) Ordena por índice y convierte a array
      const signatures: SignSignerDTO[] = Array.from(map.entries())
        .sort(([a], [b]) => a - b)
        .map(([, obj]) => {
          console.log("Processing signature object:", obj);
          return {
            signId: obj.signId,
            signatureType: obj.signatureType,
            signatureFile: obj.signatureFile,
            signatureText: obj.signatureText,
            signatureFontFamily: obj.signatureFontFamily,
            signatureColor: obj.signatureColor,
            canvasHeight: obj.canvasHeight,
            canvasWidth: obj.canvasWidth,
          };
        }) as SignSignerDTO[];

      const result = await signDocumentGuess.execute(
        token,
        documentId,
        signerId,
        signatures,
        ip,
        userAgent,
        t
      );

      if (!result) {
        const message = getErrorMessage(req, "document", "signed");
        throw new HttpError(500, message);
      }

      setSuccessMessage(req, res, "document", "signed");
      return res.status(200).json(result);
    } catch (error: any) {
      console.log("Error al firmar el documento:", error);
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "link", "validate");
      throw new HttpError(500, message);
    }
  }

  static async signSignerOwnerDocument(req: Request, res: Response) {
    try {
      const isRejected = req.body.rejected || false;
      const reason = req.body.reason || false;
      const documentId = req.params.id;
      const signerId = req.params.signerId || req.params["id"];
      const ip = req.auditIP || req.ip;
      const userAgent = req.auditUserAgent || req.headers["user-agent"] || "";
      const userId = req.user?.id;
      const t = req.t;

      if (isRejected) {
        const result = await signRejectedOwner.execute(
          userId ?? "",
          documentId,
          signerId,
          reason,
          t
        );

        if (!result) {
          const message = getErrorMessage(req, "document", "rejected");
          throw new HttpError(500, message);
        }

        setSuccessMessage(req, res, "document", "rejected");
        return res.status(200).json(null);
      }

      // 2) Recogemos todos los ficheros subidos
      const files = req.files as Express.Multer.File[];

      // 3) Map para ir agrupando por índice
      const map = new Map<number, any>();

      // 4) Recolecta campos TEXT anidados: signatures[0].signatureText, etc.
      for (const [rawKey, rawValue] of Object.entries(req.body)) {
        const m = rawKey.match(/^signatures\[(\d+)\]\.(\w+)$/);
        if (!m) continue;
        const idx = Number(m[1]);
        const prop = m[2]; // 'signatureText' o 'signatureFontFamily'
        if (!map.has(idx)) map.set(idx, {});
        map.get(idx)[prop] = rawValue;
      }

      // 5) Recolecta los FILES: fieldname = 'signatures[0].signature'
      for (const file of files) {
        const m = file.fieldname.match(/^signatures\[(\d+)\]\.signature$/);
        if (!m) continue;
        const idx = Number(m[1]);
        if (!map.has(idx)) map.set(idx, {});
        map.get(idx).signatureFile = file;
      }

      // 6) Ordena por índice y convierte a array
      const signatures: SignSignerDTO[] = Array.from(map.entries())
        .sort(([a], [b]) => a - b)
        .map(([, obj]) => ({
          signId: obj.signId,
          signatureType: obj.signatureType,
          signatureFile: obj.signatureFile,
          signatureText: obj.signatureText,
          signatureFontFamily: obj.signatureFontFamily,
        })) as SignSignerDTO[];
      console.log("validating signatures OK");

      const result = await signDocumentOwner.execute(
        userId ?? "",
        documentId,
        signerId,
        signatures,
        ip,
        userAgent,
        t
      );

      if (!result) {
        const message = getErrorMessage(req, "document", "signed");
        throw new HttpError(500, message);
      }

      setSuccessMessage(req, res, "document", "signed");
      return res.status(200).json(result);
    } catch (error: any) {
      console.log("Error al firmar el documento:", error);
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "link", "validate");
      throw new HttpError(500, message);
    }
  }

  static async reSignSignerDocument(req: Request, res: Response) {
    try {
      const documentId = req.params.id;
      const signerId = req.params.signerId || req.params["id"];
      const userData = { ...req.body, _id: req.user?.id ?? "" };
      const t = req.t;

      await reSignSignerDocument.execute(userData._id, documentId, signerId, t);

      setSuccessMessage(req, res, "document", "resigned");
      return res.status(200).json({ documentId, signerId });
    } catch (error: any) {
      console.log("Error al re-firmar el documento:", error);
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "signer", "notify");
      throw new HttpError(500, message);
    }
  }

  static async verifySignatureDocument(req: Request, res: Response) {
    const t = req.t;
    try {
      const hash = req.body.hash as string;
      const userId = req.user?.id ?? "";

      console.log("hash", hash);
      const verify = await verifySignatureDocUC.execute(userId, hash, t);

      setSuccessMessage(
        req,
        res,
        "hash",
        "verify",
        t("custom.hash_verified_successfully")
      );
      return res.status(200).json(verify);
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(
        req,
        "hash",
        "verify",
        t("custom.hash_invalid")
      );
      throw new HttpError(500, message);
    }
  }

  static async verifySignature(req: Request, res: Response) {
    const t = req.t;
    try {
      const hash = req.body.hash as string;
      const userId = req.user?.id ?? "";

      console.log("hash", hash);
      const verify = await verifySignatureUC.execute(userId, hash, t);

      setSuccessMessage(
        req,
        res,
        "hash",
        "verify",
        t("custom.hash_verified_successfully")
      );
      return res.status(200).json(verify);
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(
        req,
        "hash",
        "verify",
        t("custom.hash_invalid")
      );
      throw new HttpError(500, message);
    }
  }

  static async getCurrentStatusAdamoIdSigner(req: Request, res: Response) {
    const t = req.t;
    const token = req.token as string;

    try {
      const documentId = req.params.documentId;
      const signerId = req.params.signerId ?? "";
      const followId = req.params.followId ?? "";

      console.log("documentId", documentId);
      console.log("signerId", signerId);
      console.log("followId", followId);
      const verify = await currentStatusAdamoIdUC.execute(
        documentId,
        signerId,
        followId,
        token,
        t
      );

      console.log("Message verify", verify.message);

      setSuccessMessage(req, res, "", "", verify.message);
      return res.status(200).json(verify.status);
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(
        req,
        "",
        "",
        t("custom.validations_failed")
      );
      throw new HttpError(500, message);
    }
  }

  static async updateStatusAdamoIdSigner(req: Request, res: Response) {
    const t = req.t;
    try {
      const followId = req.params.followId;
      const body = req.body;

      console.log("followId", followId);
      const verify = await updateStatusAdamoIdUC.execute(followId, body, t);

      setSuccessMessage(
        req,
        res,
        "",
        "",
        t("custom.validations_completed_successfully")
      );
      return res.status(200).json(verify);
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(
        req,
        "",
        "",
        t("custom.validations_failed")
      );
      throw new HttpError(500, message);
    }
  }
}
