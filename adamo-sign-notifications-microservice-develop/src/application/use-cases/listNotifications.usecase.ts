// src/application/use-cases/ListNotificationsUseCase.ts
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { Notification } from "../../domain/models/notification.entity";

export class ListNotificationsUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(
    userId: string,
    userUUID?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ notifications: Notification[]; total: number }> {
    return await this.repo.findByUser(userId, userUUID, page, limit);
  }
}
