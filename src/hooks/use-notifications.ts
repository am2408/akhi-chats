"use client";

import { useState, useEffect, useCallback } from "react";
import useEvents from "./use-events";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  data: string | null;
  createdAt: string;
}

export default function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(() => {
    if (!userId) return;
    fetch(`/api/notifications?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => {
        const notifs = d.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
      })
      .catch(console.error);
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for real-time notifications via SSE
  useEvents({
    userId,
    onNotification: (data) => {
      const notif = data as Notification;
      setNotifications((prev) => {
        // Don't add duplicates
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount((c) => c + 1);

      // Browser notification if permission granted
      if (typeof window !== "undefined" && Notification.permission === "granted") {
        new Notification(notif.title, { body: notif.body });
      }
    },
  });

  const markAsRead = async (notificationId: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}