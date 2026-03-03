import React from 'react';
import ChatHeader from '../../../components/chat/chat-header';
import ChatMessages from '../../../components/chat/chat-messages';
import ChatInput from '../../../components/chat/chat-input';
import { useChatSocket } from '../../../hooks/use-chat-socket';

const ChatPage = () => {
    const { messages, sendMessage } = useChatSocket();

    return (
        <div className="flex flex-col h-full">
            <ChatHeader />
            <ChatMessages messages={messages} />
            <ChatInput onSendMessage={sendMessage} />
        </div>
    );
};

export default ChatPage;