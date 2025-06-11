import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

export const joinKanbanRoom = (kanbanId: string) => {
  socket.emit('join-kanban-room', kanbanId);
};

export const leaveKanbanRoom = (kanbanId: string) => {
  socket.emit('leave-kanban-room', kanbanId);
};

export const connectToSocket = (userId: string) => {
  console.log('Socket connection established for user:', userId);
  if (userId) {
    socket.emit('join', userId);
  }
};

export default socket;
