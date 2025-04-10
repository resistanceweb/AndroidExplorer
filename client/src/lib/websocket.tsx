import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { queryClient } from './queryClient';
import type { Team, Video, Offer, Phrase, Config } from '@shared/schema';

// Define the context type
export interface WebSocketData {
  isConnected: boolean;
  teams: Team[];
  videos: Video[];
  offers: Offer[];
  phrases: Phrase[];
  config: Config | null;
}

// Create context with default values
const defaultValues: WebSocketData = {
  isConnected: false,
  teams: [],
  videos: [],
  offers: [],
  phrases: [],
  config: null
};

const WebSocketContext = createContext<WebSocketData>(defaultValues);

// Context provider props
interface WebSocketProviderProps {
  children: ReactNode;
}

// Context provider component
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [state, setState] = useState<WebSocketData>(defaultValues);

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    // WebSocket event handlers
    ws.onopen = () => {
      console.log('WebSocket connected');
      setState(prev => ({ ...prev, isConnected: true }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setState(prev => ({ ...prev, isConnected: false }));
      
      // Attempt to reconnect after delay
      setTimeout(() => {
        setSocket(null);
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
  }, []);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (message: { type: string; data: any }) => {
    switch (message.type) {
      case 'init':
        setState(prev => ({
          ...prev,
          teams: message.data.teams || [],
          videos: message.data.videos || [],
          offers: message.data.offers || [],
          phrases: message.data.phrases || [],
          config: message.data.config || null
        }));
        break;
        
      case 'team_created':
        setState(prev => ({
          ...prev,
          teams: [...prev.teams, message.data]
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
        break;
        
      case 'team_updated':
        setState(prev => ({
          ...prev,
          teams: prev.teams.map(team => 
            team.id === message.data.id ? message.data : team
          )
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
        break;
        
      case 'team_deleted':
        setState(prev => ({
          ...prev,
          teams: prev.teams.filter(team => team.id !== message.data.id)
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
        break;
        
      case 'video_created':
        setState(prev => ({
          ...prev,
          videos: [...prev.videos, message.data]
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
        break;
        
      case 'video_deleted':
        setState(prev => ({
          ...prev,
          videos: prev.videos.filter(video => video.id !== message.data.id)
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
        break;
        
      case 'offer_created':
        setState(prev => ({
          ...prev,
          offers: [...prev.offers, message.data]
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
        break;
        
      case 'offer_updated':
        setState(prev => ({
          ...prev,
          offers: prev.offers.map(offer => 
            offer.id === message.data.id ? message.data : offer
          )
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
        break;
        
      case 'offer_deleted':
        setState(prev => ({
          ...prev,
          offers: prev.offers.filter(offer => offer.id !== message.data.id)
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
        break;
        
      case 'phrase_created':
        setState(prev => ({
          ...prev,
          phrases: [...prev.phrases, message.data]
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/phrases'] });
        break;
        
      case 'phrase_updated':
        setState(prev => ({
          ...prev,
          phrases: prev.phrases.map(phrase => 
            phrase.id === message.data.id ? message.data : phrase
          )
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/phrases'] });
        break;
        
      case 'phrase_deleted':
        setState(prev => ({
          ...prev,
          phrases: prev.phrases.filter(phrase => phrase.id !== message.data.id)
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/phrases'] });
        break;
        
      case 'config_updated':
        setState(prev => ({
          ...prev,
          config: message.data
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/config'] });
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  return (
    <WebSocketContext.Provider value={state}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);