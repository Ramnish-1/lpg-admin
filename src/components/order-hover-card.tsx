"use client"

import { useEffect, useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getOrdersData } from "@/lib/data";
import { Order } from "@/lib/types";
import { Badge } from './ui/badge';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Delivered': 'default',
  'Pending': 'secondary',
  'In-progress': 'outline',
  'Cancelled': 'destructive',
};


export function OrderHoverCard({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getOrdersData().then(setOrders);
  }, []);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
         <h4 className="font-semibold mb-2">Orders</h4>
        <ScrollArea className="h-48">
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">#{order.id.slice(0, 6)} - {order.customerName}</p>
                  <p className="text-sm text-muted-foreground">₹{order.totalAmount.toLocaleString()}</p>
                </div>
                <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
}
