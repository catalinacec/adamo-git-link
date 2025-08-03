// src/use-cases/ListDocumentsUseCase.ts
import { Document } from "../../domain/models/document.entity";
import { DocumentsRepository } from "../../infrastructure/repositories/documents.repository";

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ListDocumentsUseCase {
  constructor(private repo: DocumentsRepository = new DocumentsRepository()) {}

  async execute(
    userId: string,
    page?: number,
    limit?: number,
    filters: Record<string, any> = {}
  ): Promise<Document[] | PaginatedResult<Document>> {
    // 1. Validar que page/limit o bien ambos o ninguno
    const hasPage = page != null;
    const hasLimit = limit != null;
    if (hasPage !== hasLimit) {
      throw new Error("Both page and limit must be provided together.");
    }

    // 2. Validar positivos
    if (
      (hasPage && (isNaN(page!) || page! <= 0)) ||
      (hasLimit && (isNaN(limit!) || limit! <= 0))
    ) {
      throw new Error("Page and limit must be positive numbers.");
    }

    // 3. Validar filtros no vacíos
    const hasValidFilters = Object.values(filters).some(
      (v) => v !== null && v !== undefined && v !== ""
    );

    console.log("Filters usecase:", filters);
    // 4. Caso “sin paginación ni filtros”: traer todas las últimas versiones
    console.log("User ID:", userId);
    if (!hasPage && !hasLimit && !hasValidFilters) {
      const allDocs = await this.repo.getAllDocuments(userId);
      // agrupar por documentId y quedarnos con la versión mayor
      const latest = Object.values(
        allDocs.reduce((acc: any, doc: any) => {
          if (
            !acc[doc.documentId] ||
            acc[doc.documentId].version < doc.version
          ) {
            acc[doc.documentId] = doc;
          }
          return acc;
        }, {} as Record<string, Document>)
      ) as Document[];
      return latest;
    }

    // 5. Con paginación o filtros → delegar al repo (que maneja “última versión” internamente)
    return this.repo.listDocuments(userId, page!, limit!, filters);
  }
}
