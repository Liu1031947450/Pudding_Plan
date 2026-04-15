import { io, Socket } from 'socket.io-client';
import { API_CONFIG, API_ENDPOINTS } from '../api/config';
import * as SecureStore from 'expo-secure-store';

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect() {
    try {
      // 避免重复连接
      if (this.socket && this.socket.connected) {
        console.log('WebSocket已经连接');
        return;
      }

      const token = await SecureStore.getItemAsync('pudding_plan_auth_token');
      if (!token) {
        console.error('WebSocket连接失败：未找到认证token');
        return;
      }

      // 从API配置中获取WebSocket地址
      const wsUrl = API_CONFIG.BASE_URL.replace('http', 'ws').replace('/api', '');
      
      this.socket = io(wsUrl, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000,
        transports: ['websocket'], // 只使用websocket传输，提高性能
        autoConnect: false, // 手动连接
      });

      // 手动连接
      this.socket.connect();
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket连接失败:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket连接成功');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket断开连接:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('WebSocket重连失败，已达到最大尝试次数');
      }
    });

    this.socket.on('new_notification', (data) => {
      console.log('收到新通知:', data);
      this.triggerMessageHandler('new_notification', data);
    });
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(handler);
  }

  off(event: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private triggerMessageHandler(event: string, data: any) {
    const handlers = this.messageHandlers.get(event);
    handlers?.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`处理${event}事件时出错:`, error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// 导出单例实例
export const websocketService = new WebSocketService();
