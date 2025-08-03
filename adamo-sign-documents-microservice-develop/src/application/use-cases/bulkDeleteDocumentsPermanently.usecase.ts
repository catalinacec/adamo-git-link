// src/application/use-cases/bulkDeleteDocuments.usecase.ts

import { RabbitMQService } from "../services/rabbitmq.service";

export class BulkDeleteDocumentsPermanentlyUseCase {
  async execute(userId: string, documentIds: string[]) {
    for (const id of documentIds) {
      await RabbitMQService.publishDeletePermanentlyJob(id, userId);
    }
    return { enqueued: documentIds.length };
  }
}
