import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;

  socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err));

  return socket;
};

export const getSocket = () => socket;