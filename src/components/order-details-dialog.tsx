
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
import { IndianRupee, User, Truck, Calendar, ShoppingBag, Wallet, Package } from 'lucide-react';
import { Separator } from './ui/separator';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <ShoppingBag className="h-6 w-6 text-primary" />
            <span>Order Details</span>
          </DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(0, 6)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            
            <div className="p-4 rounded-lg border bg-muted/20">
                <h3 className="font-semibold mb-3 text-foreground">Customer & Agent</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="text-sm">
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-muted-foreground">Customer</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div className="text-sm">
                            <div className="font-medium">{order.agentName || 'Unassigned'}</div>
                            <div className="text-muted-foreground">Delivery Agent</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>Date</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Package className="h-4 w-4"/>Delivery Type</span>
                    <span>{order.deliveryType}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Wallet className="h-4 w-4"/>Payment</span>
                    <span>{order.paymentType}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">Status</span>
                    <Badge variant={statusVariant[order.status]} className="text-xs">{order.status}</Badge>
                </div>
            </div>

            <Separator />
            
            <div>
                <h4 className="font-semibold mb-2 text-foreground">Items</h4>
                <div className="space-y-2">
                {order.products.map(p => (
                    <div key={p.productId} className="flex justify-between items-center p-2 rounded-md bg-muted/40 text-sm">
                        <span>{p.name}</span>
                        <span className="text-muted-foreground">x{p.quantity}</span>
                    </div>
                ))}
                </div>
            </div>
            
            <Separator />

            <div className="flex justify-between items-center font-bold text-lg p-3 bg-primary/10 rounded-lg">
                <span className="text-primary">Total Amount</span>
                <span className="flex items-center text-primary"><IndianRupee className="h-5 w-5" />{order.totalAmount.toLocaleString()}</span>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

