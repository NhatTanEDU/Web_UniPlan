import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

export const connectToSocket = (userId: string) => {
  if (userId) {
    socket.emit('join', userId);
  }
};

export default socket;
