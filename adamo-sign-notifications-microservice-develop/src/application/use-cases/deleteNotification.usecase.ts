// src/application/use-cases/DeleteNotificationUseCase.ts
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { HttpError } from "../../utils/httpError";

export class DeleteNotificationUseCase {
  constructor(private repo: INotificationRepository) {}
  async execute(
    id: string,
    userId: string,
    userUUID: string,
    t: (t: string, vars?: Record<string, any>) => string
  ): Promise<void> {
    const notification = await this.repo.findById(id);
    if (!notification) {
      throw new HttpError(
        400,
        t("errors.resource.not_found", { resource: "Notification" })
      );
    }
    if (notification.user !== userId || notification.user !== userUUID) {
      throw new HttpError(400, t("custom.user_not_authorized"));
    }
    await this.repo.delete(id);
  }
}
