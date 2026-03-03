import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const ChatInput: React.FC<{ onSendMessage: (message: string) => void }> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="flex items-center p-4 border-t border-gray-200">
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow mr-2"
            />
            <Button onClick={handleSend}>Send</Button>
        </div>
    );
};

export default ChatInput;