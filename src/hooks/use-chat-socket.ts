import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const useChatSocket = (serverUrl: string) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socketRef.current = io(serverUrl);

        return () => {
            socketRef.current?.disconnect();
        };
    }, [serverUrl]);

    const sendMessage = (channelId: string, message: string) => {
        if (socketRef.current) {
            socketRef.current.emit('send_message', { channelId, message });
        }
    };

    const onMessageReceived = (callback: (message: any) => void) => {
        if (socketRef.current) {
            socketRef.current.on('receive_message', callback);
        }
    };

    const joinChannel = (channelId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('join_channel', channelId);
        }
    };

    return {
        sendMessage,
        onMessageReceived,
        joinChannel,
    };
};

export default useChatSocket;