// src/application/use-cases/bulkDeleteDocuments.usecase.ts

import { RabbitMQService } from "../services/rabbitmq.service";

export class BulkRestoreDocumentsUseCase {
  async execute(userId: string, documentIds: string[]) {
    for (const id of documentIds) {
      await RabbitMQService.publishRestoreJob(id, userId);
    }
    return { enqueued: documentIds.length };
  }
}
