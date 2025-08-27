"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { IndianRupee } from 'lucide-react';

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Delivered': 'default',
    'Pending': 'secondary',
    'In-progress': 'outline',
    'Cancelled': 'destructive',
  };

export function OrderDetailsDialog({ order, isOpen, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Details for order #{order.id.slice(0, 6)}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer</span>
            <span>{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Agent</span>
            <span>{order.agentName || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Type</span>
            <span>{order.deliveryType}</span>
          </div>
           <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Type</span>
            <span>{order.paymentType}</span>
          </div>
          <div>
            <h4 className="font-medium mb-2">Items</h4>
            <ul className="list-disc pl-5 space-y-1">
              {order.products.map(p => (
                <li key={p.productId}>
                  {p.name} (x{p.quantity})
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total Amount</span>
            <span className="flex items-center"><IndianRupee className="h-5 w-5" />{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
