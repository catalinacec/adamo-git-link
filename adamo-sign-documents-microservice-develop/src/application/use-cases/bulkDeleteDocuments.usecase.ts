// src/application/use-cases/bulkDeleteDocuments.usecase.ts

import { RabbitMQService } from "../services/rabbitmq.service";

export class BulkDeleteDocumentsUseCase {
  async execute(userId: string, documentIds: string[]) {
    for (const id of documentIds) {
      await RabbitMQService.publishDeleteJob(id, userId);
    }
    return { enqueued: documentIds.length };
  }
}
