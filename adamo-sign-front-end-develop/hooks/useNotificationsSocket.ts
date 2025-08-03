import type { NotificationUI } from "@/api/types/Notifications";
import NotificationsUseCase from "@/api/useCases/NotificationsUseCase";
import { settingsApp } from "@/config/environment/settings";
import { formatDistanceToNow } from "date-fns";

import { useCallback, useEffect, useReducer } from "react";

function mapNotification(raw: any): NotificationUI {
  const id = raw._id?.$oid ?? (raw as any).id ?? "";
  const createdAtRaw = raw.createdAt?.$date ?? raw.createdAt;
  return {
    id,
    data: {
      title: raw.data.title,
      message: raw.data.message,
      metadata: raw.data.metadata,
    },
    read: raw.read,
    status: raw.status ?? raw.isActive,
    timeAgo: formatDistanceToNow(new Date(createdAtRaw), { addSuffix: true }),
  };
}

type State = NotificationUI[];
type Action =
  | { type: "SET_ALL"; payload: NotificationUI[] }
  | { type: "UPSERT"; payload: NotificationUI }
  | { type: "MARK_READ"; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ALL":
      return action.payload;
    case "UPSERT": {
      const without = state.filter((n) => n.id !== action.payload.id);
      return [action.payload, ...without];
    }
    case "MARK_READ":
      return state.map((n) =>
        n.id === action.payload ? { ...n, read: true } : n,
      );
    default:
      return state;
  }
}

export function useNotificationsSocket(
  refreshUnreadCount: () => Promise<void>,
) {
  const [notifications, dispatch] = useReducer(reducer, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const resp = await NotificationsUseCase.notifications();
      const mapped = (resp.data ?? [])
        .map(mapNotification)
        // Ordenar de más reciente a más antiguo
        .sort((a, b) => {
          const ta = new Date(a.timeAgo).getTime();
          const tb = new Date(b.timeAgo).getTime();
          return tb - ta;
        });
      dispatch({ type: "SET_ALL", payload: mapped });
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();

    const socket = new WebSocket(settingsApp.api.notificationsWs);

    socket.addEventListener("message", async (evt) => {
      try {
        const raw = JSON.parse(evt.data);
        console.log("🚀 raw WS:", raw);
        const notif = mapNotification(raw);

        dispatch({ type: "UPSERT", payload: notif });
        await refreshUnreadCount();
      } catch (e) {
        console.error("Invalid WS message", e);
      }
    });

    return () => {
      socket.close();
    };
  }, [fetchNotifications, refreshUnreadCount]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await NotificationsUseCase.readConfirm(id);
        dispatch({ type: "MARK_READ", payload: id });
        await refreshUnreadCount();
      } catch (err) {
        console.error("Error marking read", err);
      }
    },
    [refreshUnreadCount],
  );

  return { notifications, markAsRead };
}
