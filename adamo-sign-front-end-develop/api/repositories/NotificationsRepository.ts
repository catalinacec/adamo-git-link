import axiosInstance from "../axiosInstance";
import { GeneralResponse } from "../types/GeneralTypes";
import { NotificationsRequest, NotificationUnread } from "../types/Notifications";

class NotificationRepository {
  async notifications(
    signal?: AbortSignal,
  ): Promise<GeneralResponse<NotificationsRequest[]>> {         
    const response = await axiosInstance.get<GeneralResponse<NotificationsRequest[]>>(
      "/notifications",
      { signal },
    );
    return response.data;
  }

  async unreadCount(
    signal?: AbortSignal,
  ): Promise<GeneralResponse<NotificationUnread>> {              
    const response = await axiosInstance.get<GeneralResponse<NotificationUnread>>(
      "/notifications/unread-count",
      { signal },
    );
    return response.data;
  }

  async readConfirm(
    id: string,
    signal?: AbortSignal,
  ): Promise<GeneralResponse<NotificationUnread>> {              
    const response = await axiosInstance.patch<GeneralResponse<NotificationUnread>>(
      `/notifications/${id}/read`,
      { signal },
    );
    return response.data;
  }

}
export default new NotificationRepository();
