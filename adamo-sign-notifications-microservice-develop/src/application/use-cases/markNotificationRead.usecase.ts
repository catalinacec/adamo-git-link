// src/application/use-cases/MarkNotificationReadUseCase.ts
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { HttpError } from "../../utils/httpError";
export class MarkNotificationReadUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(
    id: string,
    userId: string,
    userUUID: string,
    t: (t: string, vars?: Record<string, any>) => string
  ): Promise<void> {
    console.log("MarkNotificationReadUseCase.execute", {
      id,
      userId,
      userUUID,
    });
    const notification = await this.repo.findByIdOrUUID(id, userId, userUUID);
    console.log("Notification found:", notification);
    if (!notification) {
      console.error("Notification not found for ID:", id);
      throw new HttpError(
        400,
        t("errors.resource.not_found", { resource: "Notification" })
      );
    }
    console.log("Notification user:", notification.user);
    if (notification.user !== userId && notification.user !== userUUID) {
      console.error(
        "User not authorized to mark notification as read:",
        userId,
        userUUID
      );
      throw new HttpError(400, t("custom.user_not_authorized_to_mark_as_read"));
    }
    await this.repo.markAsRead(id);
  }
}
