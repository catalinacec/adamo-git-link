import { GeneralResponse } from "../types/GeneralTypes";
import { NotificationsRequest, NotificationUnread } from "../types/Notifications";
import NotificationRepository from "../repositories/NotificationsRepository";

class NotificationsUseCase {
  async notifications(
    signal?: AbortSignal,
  ): Promise<GeneralResponse<NotificationsRequest[]>> { 
    return await NotificationRepository.notifications(signal);
  }

  unreadCount(
    signal?: AbortSignal,
  ): Promise<GeneralResponse<NotificationUnread>> { 
    return NotificationRepository.unreadCount(signal);
  }

  readConfirm(
    id: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<NotificationUnread>> { 
    return NotificationRepository.readConfirm(id, signal);
  }

}

export default new NotificationsUseCase();