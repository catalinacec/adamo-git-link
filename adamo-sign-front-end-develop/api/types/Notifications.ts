export interface NotificationsRequest {
  title: string;
  data: {
    message: string;
    title: string;
    metadata?: Record<string, any>;
    };
  read: boolean;
  status: "unread" | "read";
}

export interface NotificationUI {
  id: string;
  data: {
    title: string;
    message: string;
    metadata?: Record<string, any>;
  };
  read: boolean;
  status: "unread" | "read";
  timeAgo: string;
}

export interface NotificationUnread  {
 unreadCount: number;
}