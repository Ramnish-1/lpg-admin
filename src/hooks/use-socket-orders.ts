'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSocket } from '@/context/socket-context';
import { useToast } from '@/hooks/use-toast';
import socketService, { SocketEventData, OrderEventData } from '@/lib/socket';

interface OrderSocketHook {
  orders: OrderEventData[];
  addOrder: (order: OrderEventData) => void;
  updateOrder: (orderId: string, updates: Partial<OrderEventData>) => void;
  removeOrder: (orderId: string) => void;
  clearOrders: () => void;
}

export const useSocketOrders = (): OrderSocketHook => {
  const { isConnected } = useSocket();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderEventData[]>([]);

  const addOrder = useCallback((order: OrderEventData) => {
    setOrders(prev => {
      const exists = prev.find(o => o.orderId === order.orderId);
      if (exists) {
        return prev.map(o => o.orderId === order.orderId ? { ...o, ...order } : o);
      }
      return [order, ...prev];
    });
  }, []);

  const updateOrder = useCallback((orderId: string, updates: Partial<OrderEventData>) => {
    setOrders(prev => prev.map(order => 
      order.orderId === orderId ? { ...order, ...updates } : order
    ));
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(order => order.orderId !== orderId));
  }, []);

  const clearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  // Order Created Handler
  const handleOrderCreated = useCallback((data: SocketEventData) => {
    const order = data.data as OrderEventData;
    console.log('📦 New Order Created:', order);
    
    addOrder(order);
    
    toast({
      title: "New Order Created",
      description: `Order ${order.orderNumber} from ${order.customerName}`,
      variant: "default",
    });
  }, [addOrder, toast]);

  // Order Status Updated Handler
  const handleOrderStatusUpdated = useCallback((data: SocketEventData) => {
    const order = data.data as OrderEventData;
    console.log('📋 Order Status Updated:', order);
    
    updateOrder(order.orderId, { status: order.status });
    
    const statusMessages: Record<string, string> = {
      'pending': 'Order is pending',
      'confirmed': 'Order confirmed',
      'processing': 'Order is being processed',
      'shipped': 'Order has been shipped',
      'out_for_delivery': 'Order is out for delivery',
      'delivered': 'Order delivered successfully',
      'cancelled': 'Order has been cancelled',
      'returned': 'Order has been returned'
    };

    toast({
      title: "Order Status Updated",
      description: `${order.orderNumber}: ${statusMessages[order.status || ''] || order.status}`,
      variant: order.status === 'cancelled' || order.status === 'returned' ? 'destructive' : 'default',
    });
  }, [updateOrder, toast]);

  // Order Assigned Handler
  const handleOrderAssigned = useCallback((data: SocketEventData) => {
    const order = data.data as OrderEventData;
    console.log('👤 Order Assigned:', order);
    
    updateOrder(order.orderId, { 
      assignedAgentId: order.assignedAgentId,
      agentId: order.agentId,
      agentName: order.agentName 
    });
    
    toast({
      title: "Order Assigned",
      description: `Order ${order.orderNumber} assigned to ${order.agentName}`,
      variant: "default",
    });
  }, [updateOrder, toast]);

  // Order Delivered Handler
  const handleOrderDelivered = useCallback((data: SocketEventData) => {
    const order = data.data as OrderEventData;
    console.log('✅ Order Delivered:', order);
    
    updateOrder(order.orderId, { 
      status: 'delivered',
      deliveryProof: order.deliveryProof,
      paymentReceived: order.paymentReceived,
      deliveredAt: order.deliveredAt
    });
    
    toast({
      title: "Order Delivered",
      description: `Order ${order.orderNumber} has been delivered successfully`,
      variant: "default",
    });
  }, [updateOrder, toast]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to order events
    socketService.onOrderCreated(handleOrderCreated);
    socketService.onOrderStatusUpdated(handleOrderStatusUpdated);
    socketService.onOrderAssigned(handleOrderAssigned);
    socketService.onOrderDelivered(handleOrderDelivered);

    // Cleanup on unmount
    return () => {
      socketService.offOrderCreated(handleOrderCreated);
      socketService.offOrderStatusUpdated(handleOrderStatusUpdated);
      socketService.offOrderAssigned(handleOrderAssigned);
      socketService.offOrderDelivered(handleOrderDelivered);
    };
  }, [isConnected, handleOrderCreated, handleOrderStatusUpdated, handleOrderAssigned, handleOrderDelivered]);

  return {
    orders,
    addOrder,
    updateOrder,
    removeOrder,
    clearOrders,
  };
};
