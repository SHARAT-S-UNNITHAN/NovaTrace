import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = useAuthStore.getState().accessToken;
    socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to realtime server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from realtime server');
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
