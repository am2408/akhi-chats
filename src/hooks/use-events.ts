"use client";

import { useEffect, useRef, useCallback } from "react";

type EventHandler = (data: unknown) => void;

interface UseEventsOptions {
  userId: string | undefined;
  onNotification?: EventHandler;
  onFriendsUpdate?: EventHandler;
  onStatusUpdate?: EventHandler;
  onNewDM?: EventHandler;
  onIncomingCall?: EventHandler;
  onCallEnded?: EventHandler;
}

export default function useEvents({
  userId,
  onNotification,
  onFriendsUpdate,
  onStatusUpdate,
  onNewDM,
  onIncomingCall,
  onCallEnded,
}: UseEventsOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef({
    onNotification,
    onFriendsUpdate,
    onStatusUpdate,
    onNewDM,
    onIncomingCall,
    onCallEnded,
  });

  handlersRef.current = {
    onNotification,
    onFriendsUpdate,
    onStatusUpdate,
    onNewDM,
    onIncomingCall,
    onCallEnded,
  };

  const connect = useCallback(() => {
    if (!userId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/events?userId=${userId}`);
    eventSourceRef.current = es;

    es.addEventListener("notification", (e) => {
      try { handlersRef.current.onNotification?.(JSON.parse(e.data)); } catch {}
    });

    es.addEventListener("friends_update", (e) => {
      try { handlersRef.current.onFriendsUpdate?.(JSON.parse(e.data)); } catch {}
    });

    es.addEventListener("status_update", (e) => {
      try { handlersRef.current.onStatusUpdate?.(JSON.parse(e.data)); } catch {}
    });

    es.addEventListener("new_dm", (e) => {
      try { handlersRef.current.onNewDM?.(JSON.parse(e.data)); } catch {}
    });

    es.addEventListener("incoming_call", (e) => {
      try { handlersRef.current.onIncomingCall?.(JSON.parse(e.data)); } catch {}
    });

    es.addEventListener("call_ended", (e) => {
      try { handlersRef.current.onCallEnded?.(JSON.parse(e.data)); } catch {}
    });

    es.onerror = () => {
      es.close();
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