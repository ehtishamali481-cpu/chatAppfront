

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

socket = io('/', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️ Socket.IO connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket.IO disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

export const joinConversation = (conversationId: string): void => {
  socket?.emit('conversation:join', { conversationId });
};

export const leaveConversation = (conversationId: string): void => {
  socket?.emit('conversation:leave', { conversationId });
};

export const emitTypingStart = (conversationId: string): void => {
  socket?.emit('typing:start', { conversationId });
};

export const emitTypingStop = (conversationId: string): void => {
  socket?.emit('typing:stop', { conversationId });
};

export const emitSendMessage = (
  data: {
    conversationId: string;
    messageType: string;
    text: string;
    mediaUrl?: string;
    mediaMeta?: any;
    replyTo?: string;
  },
  callback?: (response: { success: boolean; data?: any; message?: string }) => void
): void => {
  socket?.emit('message:send', data, callback);
};

export const emitMarkRead = (
  conversationId: string,
  callback?: (response: { success: boolean; data?: any }) => void
): void => {
  socket?.emit('message:read', { conversationId }, callback);
};
