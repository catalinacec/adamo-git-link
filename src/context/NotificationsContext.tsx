import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '@/services/api';

interface NotificationsContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data?.unreadCount ?? 0);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    void refreshUnreadCount();
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ unreadCount, refreshUnreadCount }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};