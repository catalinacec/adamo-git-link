"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import NotificationsUseCase from "@/api/useCases/NotificationsUseCase";

interface NotificationsContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined
);

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const resp = await NotificationsUseCase.unreadCount();
      setUnreadCount(resp.data?.unreadCount ?? 0);
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
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de su Provider");
  return ctx;
};
