// src/domain/repositories/INotificationRepository.ts
import { Notification } from "../models/notification.entity";

export interface INotificationRepository {
  findByUser(
    userId: string,
    userUUID?: string,
    page?: number,
    limit?: number
  ): Promise<{ notifications: Notification[]; total: number }>;
  markAsRead(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  create(data: Partial<Notification>): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByIdOrUUID(
    id: string,
    userId: string,
    userUUID: string
  ): Promise<Notification | null>;
  countUnreadByUser(userId: string, userUUID: string): Promise<number>;
}
