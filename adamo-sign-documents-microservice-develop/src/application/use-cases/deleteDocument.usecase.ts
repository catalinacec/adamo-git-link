import { Log } from "../../domain/models/audit-log.entity";
import { Document, EDocumentStatus } from "../../domain/models/document.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { HttpError } from "../../utils/httpError";

export class DeleteDocumentUseCase {
  constructor(private documentsRepository: DocumentsRepository) {}

  async execute(
    userId: string,
    documentId: string,
    t: (key: string, vars?: Record<string, any>) => string
  ): Promise<Document> {
    const document = await this.documentsRepository.findLatestVersion(
      userId,
      documentId
    );

    if (!document) {
      console.log("No se encontró el documento");
      throw new HttpError(
        404,
        t("errors.resource.not_found", {
          entity: t("entities.document"),
        })
      );
    }

    /**
     * Si el documento está en estado DRAFT, REJECTED o RECYCLER
     */
    if (
      document.status == EDocumentStatus.DRAFT ||
      document.status == EDocumentStatus.REJECTED ||
      document.status == EDocumentStatus.RECYCLER
    ) {
      // console.log("Verificando participantes que firmaron");
      // const signed = document.participants.filter(
      //   (p) => p.historySignatures.hasSigned
      // );

      // if (signed.length > 0) {
      //   console.log("Al menos un participante ha firmado el documento");
      //   throw new HttpError(400, t("custom.cannot_delete_signed_participant"));
      // }

      // const pending = document.participants.filter(
      //   (p) =>
      //     !p.historySignatures.hasSigned && !p.historySignatures.hasRejected
      // );

      // throw new HttpError(400, t("custom.not_all_participants_signed"));

      const newVersionData = {
        ...document,
        _id: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        isRollback: false,
        isRecycler: document.status !== EDocumentStatus.RECYCLER,
        isDeleted: document.status === EDocumentStatus.RECYCLER,
        isActive: false,
        status:
          document.status === EDocumentStatus.RECYCLER
            ? EDocumentStatus.DELETED
            : EDocumentStatus.RECYCLER,
      };

      await this.documentsRepository.updateMany(
        { owner: userId, documentId },
        {
          $set: {
            status:
              document.status === EDocumentStatus.RECYCLER
                ? EDocumentStatus.DELETED
                : EDocumentStatus.RECYCLER,
            isActive: false,
            isRecycler: document.status !== EDocumentStatus.RECYCLER,
            isDeleted: document.status === EDocumentStatus.RECYCLER,
          },
        }
      );

      const result = await this.documentsRepository.createNewVersion(
        newVersionData
      );

      return result;
    } else {
      if (document.status == EDocumentStatus.DELETED) {
        console.log("El documento ya está eliminado");
        throw new HttpError(400, t("custom.cannot_delete_not_found"));
      }

      console.log(
        "El documento no se puede eliminar porque está en estado:",
        document.status
      );
      throw new HttpError(400, t("custom.cannot_delete_invalid_status"));
    }
  }
}
