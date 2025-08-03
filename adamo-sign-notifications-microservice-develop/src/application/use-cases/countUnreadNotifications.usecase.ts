// src/application/use-cases/CountUnreadNotificationsUseCase.ts
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class CountUnreadNotificationsUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(userId: string, userUUID: string): Promise<number> {
    return await this.repo.countUnreadByUser(userId, userUUID);
  }
}
