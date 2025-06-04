// TEMPORARILY DISABLED - Preventing 404 logs while Socket.IO server is disabled
// import { io } from 'socket.io-client';
// const SOCKET_URL = 'http://localhost:5000';

// TEMPORARILY DISABLED - Preventing 404 logs while Socket.IO server is disabled
// export const socket = io(SOCKET_URL, {
//   autoConnect: true,
//   reconnection: true,
// });

// Mock socket to prevent frontend errors
export const socket = {
  emit: () => {},
  on: () => {},
  off: () => {},
  disconnect: () => {},
  connected: false
};

export const connectToSocket = (userId: string) => {
  // Disabled to prevent 404 logs
  console.log('Socket connection disabled to prevent backend logs');
  // if (userId) {
  //   socket.emit('join', userId);
  // }
};

export default socket;
