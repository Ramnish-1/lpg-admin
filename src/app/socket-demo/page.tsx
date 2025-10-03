'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSocket } from '@/context/socket-context';
import { useSocketOrders } from '@/hooks/use-socket-orders';
import { useSocketInventory } from '@/hooks/use-socket-inventory';
import { useSocketAgencies } from '@/hooks/use-socket-agencies';
import { useForceLogout } from '@/hooks/use-force-logout';
import { SocketStatus } from '@/components/socket-status';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Wifi, 
  WifiOff, 
  Package, 
  ShoppingCart, 
  Building, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';

export default function SocketDemoPage() {
  const { socket, isConnected, connect, disconnect, emit } = useSocket();
  const { orders } = useSocketOrders();
  const { inventory, products } = useSocketInventory();
  const { agencies, agents } = useSocketAgencies();
  const { isListening } = useForceLogout();
  const { toast } = useToast();

  const [eventLog, setEventLog] = useState<Array<{
    id: string;
    timestamp: string;
    event: string;
    data: any;
    type: 'order' | 'product' | 'inventory' | 'agency' | 'agent' | 'system';
  }>>([]);

  const addToEventLog = (event: string, data: any, type: 'order' | 'product' | 'inventory' | 'agency' | 'agent' | 'system') => {
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      event,
      data,
      type
    };
    setEventLog(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 events
  };

  // Monitor socket events for demo
  useEffect(() => {
    if (!socket) return;

    const events = [
      'order:created',
      'order:status-updated', 
      'order:assigned',
      'order:delivered',
      'product:created',
      'product:updated',
      'inventory:updated',
      'inventory:low-stock',
      'agency:created',
      'agency:updated',
      'agent:created',
      'agent:updated',
      'notification',
      'system:message',
      'user:force-logout',
      'agency:force-logout'
    ];

    const handlers: Record<string, (data: any) => void> = {};

    events.forEach(event => {
      const handler = (data: any) => {
        const eventType = event.startsWith('order:') ? 'order' :
                         event.startsWith('product:') ? 'product' :
                         event.startsWith('inventory:') ? 'inventory' :
                         event.startsWith('agency:') ? 'agency' :
                         event.startsWith('agent:') ? 'agent' : 'system';
        
        addToEventLog(event, data, eventType);
      };
      
      handlers[event] = handler;
      socket.on(event, handler);
    });

    return () => {
      events.forEach(event => {
        socket.off(event, handlers[event]);
      });
    };
  }, [socket]);

  const handleTestEvent = (eventType: string) => {
    const testData = {
      'test-order': {
        orderId: 'test-' + Date.now(),
        orderNumber: 'ORD-' + Date.now(),
        customerName: 'Test Customer',
        status: 'pending'
      },
      'test-product': {
        id: 'prod-' + Date.now(),
        productName: 'Test Product',
        category: 'Test Category'
      },
      'test-inventory': {
        productId: 'prod-123',
        productName: 'Test Product',
        agencyId: 'agency-123',
        agencyName: 'Test Agency',
        stock: 5,
        lowStockThreshold: 10
      },
      'test-notification': {
        type: 'CUSTOM_NOTIFICATION',
        message: 'This is a test notification',
        timestamp: new Date().toISOString()
      }
    };

    emit(eventType, testData[eventType as keyof typeof testData]);
    toast({
      title: "Test Event Sent",
      description: `Emitted ${eventType} event`,
      variant: "default",
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      case 'agency': return <Building className="h-4 w-4" />;
      case 'agent': return <Users className="h-4 w-4" />;
      case 'system': return <Zap className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'product': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inventory': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'agency': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'agent': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'system': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <AppShell>
      <PageHeader title="Socket.IO Demo & Testing">
        <SocketStatus />
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Socket Connected:</span>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Force Logout Active:</span>
              <Badge variant={isListening ? 'default' : 'secondary'}>
                {isListening ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Socket ID:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {socket?.id || 'N/A'}
              </code>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => connect()} 
                disabled={isConnected}
                variant="outline"
              >
                Connect
              </Button>
              <Button 
                size="sm" 
                onClick={disconnect} 
                disabled={!isConnected}
                variant="outline"
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Data Counts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Real-time Data
            </CardTitle>
            <CardDescription>
              Data received via socket events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders:
              </span>
              <Badge variant="outline">{orders.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products:
              </span>
              <Badge variant="outline">{products.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory Items:
              </span>
              <Badge variant="outline">{inventory.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Agencies:
              </span>
              <Badge variant="outline">{agencies.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Agents:
              </span>
              <Badge variant="outline">{agents.length}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Test Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Test Events
            </CardTitle>
            <CardDescription>
              Send test events to the server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleTestEvent('test-order')}
              disabled={!isConnected}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Test Order Event
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleTestEvent('test-product')}
              disabled={!isConnected}
            >
              <Package className="h-4 w-4 mr-2" />
              Test Product Event
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleTestEvent('test-inventory')}
              disabled={!isConnected}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Test Low Stock Alert
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleTestEvent('test-notification')}
              disabled={!isConnected}
            >
              <Zap className="h-4 w-4 mr-2" />
              Test Notification
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Event Log */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Live Event Log
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setEventLog([])}
            >
              Clear Log
            </Button>
          </CardTitle>
          <CardDescription>
            Real-time socket events (last 50 events)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {eventLog.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No events received yet. Connect to socket and perform actions to see live events.
              </div>
            ) : (
              eventLog.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className={cn("p-1 rounded", getEventTypeColor(log.type))}>
                    {getEventTypeIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {log.event}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp}
                      </span>
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
