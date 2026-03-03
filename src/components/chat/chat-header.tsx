import React from 'react';

interface ChatHeaderProps {
  channelName: string;
  onlineUsers: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ channelName, onlineUsers }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold">{channelName}</h1>
      <span className="text-sm">{onlineUsers} users online</span>
    </div>
  );
};

export default ChatHeader;