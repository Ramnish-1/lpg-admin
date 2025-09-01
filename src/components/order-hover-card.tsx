
"use client"

import { useEffect, useState, useContext } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Order } from "@/lib/types";
import { Badge } from './ui/badge';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Delivered': 'default',
  'Pending': 'secondary',
  'In-progress': 'outline',
  'Cancelled': 'destructive',
};


export function OrderHoverCard({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const { token } = useContext(AuthContext);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders?limit=10`, { // Fetch last 10 orders
             headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setOrders(result.data.orders);
        } else {
           toast({ variant: 'destructive', title: 'Error', description: 'Could not load recent orders for hover card.' });
        }
      } catch (error) {
        console.error("Failed to load orders for hover card", error);
      }
    };
    fetchOrders();
  }, [token, toast]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
         <h4 className="font-semibold mb-2">Recent Orders</h4>
        <ScrollArea className="h-48">
          <div className="space-y-4">
            {orders.length > 0 ? orders.map(order => (
              <div key={order.id} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">#{order.id.slice(0, 6)} - {order.customerName}</p>
                  <p className="text-sm text-muted-foreground">₹{order.totalAmount.toLocaleString()}</p>
                </div>
                <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center pt-4">No recent orders found.</p>
            )}
          </div>
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
}
