// src/domain/repositories/INotificationRepository.ts
import { Notification } from "../models/notification.entity";

export interface INotificationRepository {
  countUnreadByUser(userId: string): Promise<number>;
}
