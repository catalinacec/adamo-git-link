import { Notification } from "../models/notification.entity";

export interface INotificationRepository {
  create(data: Partial<Notification>): Promise<Notification>;
}
