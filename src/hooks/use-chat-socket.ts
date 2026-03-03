"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

const useChatSocket = (channelId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = () => {
      fetch(`/api/messages?channelId=${channelId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages) setMessages(data.messages);
        })
        .catch(console.error);
    };

    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [channelId]);

  return { messages, setMessages };
};

export default useChatSocket;