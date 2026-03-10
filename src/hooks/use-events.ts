"use client";

import { useEffect, useRef, useCallback } from "react";

type EventHandler = (data: unknown) => void;

interface UseEventsOptions {
  userId: string | undefined;
  onNotification?: EventHandler;
  onFriendsUpdate?: EventHandler;
  onStatusUpdate?: EventHandler;
  onNewDM?: EventHandler;
}

export default function useEvents({
  userId,
  onNotification,
  onFriendsUpdate,
  onStatusUpdate,
  onNewDM,
}: UseEventsOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef({ onNotification, onFriendsUpdate, onStatusUpdate, onNewDM });

  // Keep handlers ref up to date
  handlersRef.current = { onNotification, onFriendsUpdate, onStatusUpdate, onNewDM };

  const connect = useCallback(() => {
    if (!userId) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/events?userId=${userId}`);
    eventSourceRef.current = es;

    es.addEventListener("notification", (e) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onNotification?.(data);
      } catch {}
    });

    es.addEventListener("friends_update", (e) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onFriendsUpdate?.(data);
      } catch {}
    });

    es.addEventListener("status_update", (e) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onStatusUpdate?.(data);
      } catch {}
    });

    es.addEventListener("new_dm", (e) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onNewDM?.(data);
      } catch {}
    });

    es.onerror = () => {
      es.close();
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          connect();
        }
      }, 3000);
    };
  }, [userId]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [connect]);
}