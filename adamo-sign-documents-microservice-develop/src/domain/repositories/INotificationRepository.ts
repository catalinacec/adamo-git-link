// src/domain/repositories/INotificationRepository.ts
import { Notification } from "../models/notification.entity";

export interface INotificationRepository {
  create(data: Partial<Notification>): Promise<Notification>;
}
