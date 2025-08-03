// src/application/use-cases/DeleteNotificationUseCase.ts
import { sendNotification } from "../../index";
import { Notification } from "../../domain/models/notification.entity";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { HttpError } from "../../utils/httpError";

export class CreateNotificationUseCase {
  constructor(private repo: INotificationRepository) {}
  async execute(
    notification: Notification,
    t: (t: string, vars?: Record<string, any>) => string
  ): Promise<Notification> {
    try {
      const createNotification = await this.repo.create(notification);

      sendNotification(notification.user, {
        message: "¡Tienes una nueva notificación!",
        data: createNotification,
      });

      return createNotification;
    } catch (error) {
      throw new HttpError(
        400,
        t("common.error", {
          entity: t(`entities.notification`),
          action: t(`infinitive_actions.create`),
        })
      );
    }
  }
}
