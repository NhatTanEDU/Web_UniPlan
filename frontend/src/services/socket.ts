import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

// Kanban room management
export const joinKanbanRoom = (kanbanId: string) => {
  socket.emit('join-kanban-room', kanbanId);
};

export const leaveKanbanRoom = (kanbanId: string) => {
  socket.emit('leave-kanban-room', kanbanId);
};

// Team room management for real-time team member updates
export const joinTeamRoom = (teamId: string) => {
  socket.emit('join_team', teamId);
};

export const leaveTeamRoom = (teamId: string) => {
  socket.emit('leave_team', teamId);
};

export const connectToSocket = (userId: string) => {
  console.log('Socket connection established for user:', userId);
  if (userId) {
    socket.emit('join', userId);
  }
};

export default socket;
