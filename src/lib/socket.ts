import { io, Socket } from 'socket.io-client';

export interface SocketEventData {
  data: any;
  timestamp?: string;
  type?: string;
}

export interface OrderEventData {
  orderId: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount?: number;
  agencyId?: string;
  status?: string;
  assignedAgentId?: string;
  agentId?: string;
  agentName?: string;
  deliveryProof?: any;
  paymentReceived?: boolean;
  deliveredAt?: string;
  reason?: string;
  otpSent?: boolean;
}

export interface ProductEventData {
  id: string;
  productName: string;
  category?: string;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface InventoryEventData {
  productId: string;
  productName: string;
  agencyId: string;
  agencyName: string;
  stock: number;
  lowStockThreshold?: number;
  action?: 'added' | 'updated' | 'removed';
}

export interface AgencyEventData {
  id: string;
  name: string;
  email: string;
  city?: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
  statusChanged?: boolean;
}

export interface AgentEventData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  agencyId: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface NotificationEventData {
  userId?: string;
  email?: string;
  role?: string;
  name?: string;
  loginTime?: string;
  isBlocked?: boolean;
  blockedBy?: string;
  timestamp?: string;
  type: string;
  message?: string;
  messageType?: 'info' | 'warning' | 'error' | 'success';
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token?: string): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    try {
      const authToken = token || this.getAuthToken();
      
      this.socket = io(socketUrl, {
        auth: { 
          token: authToken // Don't send 'guest-token', backend handles missing token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        maxHttpBufferSize: 1e8,
        pingTimeout: 30000,
        pingInterval: 10000,
        upgrade: true,
        rememberUpgrade: true
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      return null;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      console.log('🔑 Getting auth token:', token ? 'Found' : 'Not found');
      return token;
    }
    return null;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket Connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Auto-subscribe based on user role
      setTimeout(() => {
        this.autoSubscribe();
      }, 1000);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket Disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket Connection Error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket Reconnection Error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket Error:', error);
    });
  }

  private autoSubscribe(): void {
    if (!this.socket || typeof window === 'undefined') return;

    try {
      const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
      const agencyId = localStorage.getItem('agencyId') || sessionStorage.getItem('agencyId');
      const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

      switch (userRole) {
        case 'admin':
          this.socket.emit('subscribe-orders');
          this.socket.emit('subscribe-products');
          this.socket.emit('subscribe-agencies');
          this.socket.emit('subscribe-agents');
          console.log('🔔 Admin subscribed to all events');
          break;

        case 'agency_owner':
          this.socket.emit('subscribe-orders');
          if (agencyId) {
            this.socket.emit('subscribe-inventory', agencyId);
          }
          console.log('🔔 Agency owner subscribed to orders and inventory');
          break;

        case 'customer':
          this.socket.emit('subscribe-orders');
          console.log('🔔 Customer subscribed to orders');
          break;

        case 'agent':
          this.socket.emit('subscribe-orders');
          console.log('🔔 Agent subscribed to orders');
          break;

        default:
          console.log('🔔 No specific subscriptions for role:', userRole);
      }
    } catch (error) {
      console.error('Auto-subscribe error:', error);
    }
  }

  // Event Listeners
  onOrderCreated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('order:created', callback);
  }

  onOrderStatusUpdated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('order:status-updated', callback);
  }

  onOrderAssigned(callback: (data: SocketEventData) => void): void {
    this.socket?.on('order:assigned', callback);
  }

  onOrderDelivered(callback: (data: SocketEventData) => void): void {
    this.socket?.on('order:delivered', callback);
  }

  onProductCreated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('product:created', callback);
  }

  onProductUpdated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('product:updated', callback);
  }

  onInventoryUpdated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('inventory:updated', callback);
  }

  onLowStock(callback: (data: SocketEventData) => void): void {
    this.socket?.on('inventory:low-stock', callback);
  }

  onAgencyCreated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('agency:created', callback);
  }

  onAgencyUpdated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('agency:updated', callback);
  }

  onAgentCreated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('agent:created', callback);
  }

  onAgentUpdated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('agent:updated', callback);
  }

  onAgentStatusUpdated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('agent:status-updated', callback);
  }

  onNotification(callback: (data: SocketEventData) => void): void {
    this.socket?.on('notification', callback);
  }

  onSystemMessage(callback: (data: SocketEventData) => void): void {
    this.socket?.on('system:message', callback);
  }

  onForceLogout(callback: (data: SocketEventData) => void): void {
    this.socket?.on('user:force-logout', callback);
    this.socket?.on('agency:force-logout', callback);
  }

  onTermsCreated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('terms:created', callback);
  }

  onTermsUpdated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('terms:updated', callback);
  }

  onPrivacyCreated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('privacy:created', callback);
  }

  onPrivacyUpdated(callback: (data: SocketEventData) => void): void {
    this.socket?.on('privacy:updated', callback);
  }

  // Remove Event Listeners
  offOrderCreated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('order:created', callback);
  }

  offOrderStatusUpdated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('order:status-updated', callback);
  }

  offOrderAssigned(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('order:assigned', callback);
  }

  offOrderDelivered(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('order:delivered', callback);
  }

  offProductCreated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('product:created', callback);
  }

  offProductUpdated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('product:updated', callback);
  }

  offInventoryUpdated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('inventory:updated', callback);
  }

  offLowStock(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('inventory:low-stock', callback);
  }

  offAgencyCreated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('agency:created', callback);
  }

  offAgencyUpdated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('agency:updated', callback);
  }

  offAgentCreated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('agent:created', callback);
  }

  offAgentUpdated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('agent:updated', callback);
  }

  offAgentStatusUpdated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('agent:status-updated', callback);
  }

  offNotification(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('notification', callback);
  }

  offSystemMessage(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('system:message', callback);
  }

  offForceLogout(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('user:force-logout', callback);
    this.socket?.off('agency:force-logout', callback);
  }

  offTermsCreated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('terms:created', callback);
  }

  offTermsUpdated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('terms:updated', callback);
  }

  offPrivacyCreated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('privacy:created', callback);
  }

  offPrivacyUpdated(callback?: (data: SocketEventData) => void): void {
    this.socket?.off('privacy:updated', callback);
  }

  // Manual Subscriptions
  subscribeToOrders(): void {
    this.socket?.emit('subscribe-orders');
  }

  subscribeToProducts(): void {
    this.socket?.emit('subscribe-products');
  }

  subscribeToAgencies(): void {
    this.socket?.emit('subscribe-agencies');
  }

  subscribeToAgents(): void {
    this.socket?.emit('subscribe-agents');
  }

  subscribeToInventory(agencyId: string): void {
    this.socket?.emit('subscribe-inventory', agencyId);
  }

  // Utility Methods
  isSocketConnected(): boolean {
    return this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit custom events
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Generic event listener
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  // Generic event listener removal
  off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
