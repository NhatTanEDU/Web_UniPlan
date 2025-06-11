// filepath: d:\Official_Project\Project_UniPlan\my_uniplan\frontend\src\hooks\useTeamRealTime.ts
import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../components/context/AuthContext';
import useWebSocket from './useWebSocket';

interface TeamEvent {
  type: 'team_created' | 'team_updated' | 'team_deleted' | 'member_added' | 'member_removed' | 'activity_logged' | 'notification_received';
  teamId: string;
  data: any;
  timestamp: string;
  userId: string;
}

interface UseTeamRealTimeConfig {
  onTeamUpdate?: (event: TeamEvent) => void;
  onNotification?: (notification: any) => void;
  onActivity?: (activity: any) => void;
}

export const useTeamRealTime = (config: UseTeamRealTimeConfig = {}) => {
  const { userId } = useContext(AuthContext);
  const [realtimeEvents, setRealtimeEvents] = useState<TeamEvent[]>([]);

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'team_event') {
      const event: TeamEvent = data.payload;
      
      // Add to events list
      setRealtimeEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events

      // Handle specific event types
      switch (event.type) {
        case 'team_created':
        case 'team_updated':
        case 'team_deleted':
        case 'member_added':
        case 'member_removed':
          config.onTeamUpdate?.(event);
          break;
        
        case 'activity_logged':
          config.onActivity?.(event.data);
          break;
        
        case 'notification_received':
          config.onNotification?.(event.data);
          break;
      }
    }
  }, [config]);

  const { isConnected, sendMessage, error } = useWebSocket({
    url: 'ws://localhost:5000/ws/teams',
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('Connected to team real-time updates');
      // Subscribe to user's teams
      if (userId) {
        sendMessage({
          type: 'subscribe_user_teams',
          userId
        });
      }
    },
    onDisconnect: () => {
      console.log('Disconnected from team real-time updates');
    },
    reconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10
  });

  const subscribeToTeam = useCallback((teamId: string) => {
    sendMessage({
      type: 'subscribe_team',
      teamId
    });
  }, [sendMessage]);

  const unsubscribeFromTeam = useCallback((teamId: string) => {
    sendMessage({
      type: 'unsubscribe_team',
      teamId
    });
  }, [sendMessage]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    sendMessage({
      type: 'mark_notification_read',
      notificationId
    });
  }, [sendMessage]);

  return {
    isConnected,
    error,
    realtimeEvents,
    subscribeToTeam,
    unsubscribeFromTeam,
    markNotificationAsRead
  };
};

export default useTeamRealTime;
