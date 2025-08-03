import { EParticipantStatus } from "../../domain/models/document.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { HttpError } from "../../utils/httpError";

export class ListPendingDocumentsUseCase {
  constructor(
    private repo: DocumentsRepository = new DocumentsRepository(),
    private userRepo: UserRepository = new UserRepository()
  ) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
    filters: any
  ): Promise<{
    documents: Document[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    // 1) Verificar que el usuario exista
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new HttpError(400, "user", "not_found");
    }

    // 2) Traer solo documentos pendientes (última versión, IN_PROGRESS + participante pending)
    const { data: documents, pagination } =
      await this.repo.listLastPendingDocumentsByLatestVersion(
        user.email,
        page,
        limit
      );

    // 3) (Opcional) añadir propiedad canSign desde historySignatures
    const docsWithFlags = documents.map((doc: any) => ({
      ...doc,
      participants: doc.participants.map((p: any) => ({
        canSign: p.historySignatures?.canSign ?? true,
        ...p,
      })),
    }));

    return {
      documents: docsWithFlags,
      pagination,
    };
  }
}
