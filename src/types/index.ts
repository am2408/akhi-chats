export interface User {
    id: string;
    username: string;
    avatarUrl?: string;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    channelId: string;
    timestamp: Date;
}

export interface Channel {
    id: string;
    name: string;
    serverId: string;
    messages: Message[];
}

export interface Server {
    id: string;
    name: string;
    channels: Channel[];
    members: User[];
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    timestamp: Date;
}

export interface FileUpload {
    id: string;
    fileName: string;
    fileUrl: string;
    uploaderId: string;
    timestamp: Date;
}