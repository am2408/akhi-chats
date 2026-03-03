import React from 'react';

interface ChatItemProps {
    username: string;
    message: string;
    timestamp: string;
    isOwnMessage: boolean;
}

const ChatItem: React.FC<ChatItemProps> = ({ username, message, timestamp, isOwnMessage }) => {
    return (
        <div className={`flex items-start mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {!isOwnMessage && <span className="font-bold mr-2">{username}</span>}
            <div className={`p-2 rounded-lg ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                <p>{message}</p>
                <span className="text-xs text-gray-500">{timestamp}</span>
            </div>
        </div>
    );
};

export default ChatItem;