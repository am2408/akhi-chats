"use client";

import { useEffect, useState } from "react";

interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
}

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(console.error);

    try {
      const eventSource = new EventSource("/api/notifications/stream");
      eventSource.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          setNewNotification(notification);
          setNotifications((prev) => [...prev, notification]);
        } catch {
          // ignore parse errors
        }
      };

      return () => {
        eventSource.close();
      };
    } catch {
      // SSE not available
    }
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return { notifications, newNotification, markAsRead };
};

export default useNotifications;