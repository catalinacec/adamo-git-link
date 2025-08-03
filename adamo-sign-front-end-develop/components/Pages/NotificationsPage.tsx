"use client";

import { NotificationUI } from "@/api/types/Notifications";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { useNotifications } from "@/context/NotificationsContext";

import { cn } from "@/lib/utils";

import { Card } from "@/components/Card";
import { AppHeader } from "@/components/ui/AppHeader";
import { Container } from "@/components/ui/Container";

import { useNotificationsSocket } from "@/hooks/useNotificationsSocket";

export default function NotificationsPage() {
  const t = useTranslations("NotificationsPage");
  const { refreshUnreadCount } = useNotifications();
  const { notifications, markAsRead } =
    useNotificationsSocket(refreshUnreadCount);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set(),
  );

  const toggleMessageExpansion = (notificationId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleClickNotification = (noti: NotificationUI) => () => {
    const notification = notifications.find((n) => n.id === noti.id);
    const metadata = notification?.data?.metadata;
    console.log("Notification metadata:", metadata);
    if (
      metadata &&
      metadata.enabledRead === true &&
      metadata.typeRead === "new_document" &&
      metadata.link
    ) {
      console.log("Opening link:", metadata.link);
      window.open(metadata.link, "_blank");
    }
    if (!noti.read) {
      markAsRead(noti.id);
    }
  };

  return (
    <div className="space-y-4">
      <AppHeader heading={t("title")} />

      <Container>
        {notifications.length === 0 ? (
          <Card className="rounded-2xl !p-4">
            <p>{t("noNotifications")}</p>
          </Card>
        ) : (
          <Card className="!p-4">
            <div className="space-y-4">
              {notifications.map((notification) => {
                const isExpanded = expandedMessages.has(notification.id);

                return (
                  <Card
                    key={notification.id}
                    onClick={handleClickNotification(notification)}
                    className={cn(
                      "flex flex-col items-start gap-4 rounded-2xl !p-4 md:flex-row md:justify-between transition-colors",
                      notification.read
                        ? "bg-white cursor-default"
                        : "bg-adamo-sign-50 cursor-pointer hover:bg-gray-100",
                    )}
                  >
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold text-neutral-700">
                        {notification.data.title}
                      </h4>
                      <div className="relative">
                        {!isExpanded &&
                        notification.data.message.length > 120 ? (
                          <p>
                            {notification.data.message.slice(0, 120)}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMessageExpansion(notification.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 focus:outline-none ml-1"
                            >
                              ...
                            </button>
                          </p>
                        ) : (
                          <p>
                            {notification.data.message}
                            {isExpanded &&
                              notification.data.message.length > 120 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMessageExpansion(notification.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 focus:outline-none ml-2 text-sm"
                                >
                                  {t("showLess")}
                                </button>
                              )}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-neutral-400">
                      {notification.timeAgo}
                    </span>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}
      </Container>
    </div>
  );
}
