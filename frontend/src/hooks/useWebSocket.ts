// filepath: d:\Official_Project\Project_UniPlan\my_uniplan\frontend\src\hooks\useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketConfig {
  url: string;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  lastMessage: any;
  error: string | null;
  reconnectAttempt: number;
}

export const useWebSocket = (config: WebSocketConfig) => {
  const {
    url,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = config;

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastMessage: null,
    error: null,
    reconnectAttempt: 0
  });

  const connect = useCallback(() => {
    try {
      // Add auth token to WebSocket URL
      const token = localStorage.getItem('token');
      const wsUrl = token ? `${url}?token=${token}` : url;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          error: null,
          reconnectAttempt: 0
        }));
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState(prev => ({
            ...prev,
            lastMessage: data
          }));
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setState(prev => ({
          ...prev,
          isConnected: false
        }));
        onDisconnect?.();

        // Attempt reconnection if enabled
        if (reconnect && state.reconnectAttempt < maxReconnectAttempts) {
          reconnectTimer.current = setTimeout(() => {
            setState(prev => ({
              ...prev,
              reconnectAttempt: prev.reconnectAttempt + 1
            }));
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection error'
        }));
        onError?.(error);
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to create WebSocket connection'
      }));
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnect, reconnectInterval, maxReconnectAttempts, state.reconnectAttempt]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false
    }));
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    sendMessage,
    connect,
    disconnect
  };
};

export default useWebSocket;
