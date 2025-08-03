// src/application/use-cases/bulkDeleteContacts.usecase.ts
import { RabbitMQService } from "../services/rabbitmq.service";

export class BulkDeleteContactsUseCase {
  async execute(userId: string, contactIds: string[]) {
    for (const id of contactIds) {
      await RabbitMQService.publishDeleteJob(id, userId);
    }
    return { enqueued: contactIds.length };
  }
}
