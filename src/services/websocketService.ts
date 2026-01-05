import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

interface WebSocketMessage {
  type: 'new_message' | 'pong' | 'error';
  message?: any;
  error?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private chatId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private onMessageCallback: ((message: any) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private onCloseCallback: (() => void) | null = null;

  async connect(chatId: number, onMessage: (message: any) => void, onError?: (error: Error) => void, onClose?: () => void): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.chatId === chatId) {
      // Already connected to this chat
      return;
    }

    // Close existing connection if different chat
    if (this.ws && this.chatId !== chatId) {
      this.disconnect();
    }

    this.chatId = chatId;
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError || null;
    this.onCloseCallback = onClose || null;

    try {
      // Get access token
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      // Convert HTTP URL to WebSocket URL
      const wsUrl = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      const url = `${wsUrl}/chats/ws/${chatId}?token=${encodeURIComponent(token)}`;

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        if (__DEV__) {
          console.log('[WebSocket] Connected to chat', chatId);
        }
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          if (__DEV__) {
            console.log('[WebSocket] Received message:', data.type, data.message ? `message ID: ${data.message.id}` : '');
          }
          
          if (data.type === 'pong') {
            // Heartbeat response, ignore
            return;
          }
          
          if (data.type === 'new_message' && data.message && this.onMessageCallback) {
            if (__DEV__) {
              console.log('[WebSocket] Calling onMessageCallback for message:', data.message.id);
            }
            this.onMessageCallback(data.message);
          }
          
          if (data.type === 'error' && this.onErrorCallback) {
            this.onErrorCallback(new Error(data.error || 'WebSocket error'));
          }
        } catch (error) {
          if (__DEV__) {
            console.error('[WebSocket] Error parsing message:', error);
          }
          if (this.onErrorCallback) {
            this.onErrorCallback(error as Error);
          }
        }
      };

      this.ws.onerror = (error) => {
        if (__DEV__) {
          console.error('[WebSocket] Error:', error);
        }
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('WebSocket connection error'));
        }
      };

      this.ws.onclose = () => {
        if (__DEV__) {
          console.log('[WebSocket] Connection closed');
        }
        this.stopHeartbeat();
        
        if (this.onCloseCallback) {
          this.onCloseCallback();
        }

        // Attempt to reconnect if not manually disconnected
        if (this.chatId !== null && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            if (this.chatId !== null) {
              this.connect(this.chatId, this.onMessageCallback!, this.onErrorCallback || undefined, this.onCloseCallback || undefined);
            }
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };
    } catch (error) {
      if (__DEV__) {
        console.error('[WebSocket] Connection error:', error);
      }
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.chatId = null;
    this.reconnectAttempts = 0;
    this.onMessageCallback = null;
    this.onErrorCallback = null;
    this.onCloseCallback = null;
  }

  sendMessage(content: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        content: content
      }));
    } else {
      if (__DEV__) {
        console.warn('[WebSocket] Cannot send message, connection not open');
      }
    }
  }

  private startHeartbeat(): void {
    // Send ping every 30 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();

