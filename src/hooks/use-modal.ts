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

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(console.error);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return { notifications, markAsRead };
};

export default useNotifications;