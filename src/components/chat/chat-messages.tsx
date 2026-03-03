import React from 'react';
import { useChatSocket } from '../../hooks/use-chat-socket';
import ChatItem from './chat-item';

const ChatMessages = () => {
    const { messages } = useChatSocket();

    return (
        <div className="chat-messages overflow-y-auto">
            {messages.map((message) => (
                <ChatItem key={message.id} message={message} />
            ))}
        </div>
    );
};

export default ChatMessages;