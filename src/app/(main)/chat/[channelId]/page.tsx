import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ChatHeader from '@/components/chat/chat-header';
import ChatMessages from '@/components/chat/chat-messages';
import ChatInput from '@/components/chat/chat-input';
import { useChatSocket } from '@/hooks/use-chat-socket';

const ChannelChatPage = () => {
  const router = useRouter();
  const { channelId } = router.query;
  const [messages, setMessages] = useState([]);
  const { connect, disconnect } = useChatSocket(channelId);

  useEffect(() => {
    if (channelId) {
      connect(channelId);
    }
    return () => {
      disconnect();
    };
  }, [channelId, connect, disconnect]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader channelId={channelId} />
      <ChatMessages messages={messages} />
      <ChatInput channelId={channelId} setMessages={setMessages} />
    </div>
  );
};

export default ChannelChatPage;