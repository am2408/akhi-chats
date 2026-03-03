export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  status: string;
}

export interface Server {
  id: string;
  name: string;
  icon: string | null;
  inviteCode: string;
  ownerId: string;
}

export interface Channel {
  id: string;
  name: string;
  type: string;
  serverId: string;
}

export interface Message {
  id: string;
  content: string;
  fileUrl: string | null;
  userId: string;
  channelId: string;
  createdAt: string;
  user?: User;
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