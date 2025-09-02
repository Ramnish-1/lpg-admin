

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { IndianRupee, User, Truck, Calendar, ShoppingBag, Wallet, Package, Phone, MapPin, XCircle, Undo2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import Link from 'next/link';


const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M16.75,13.96C17,14.26 17.25,14.71 17.25,15.26C17.25,15.81 17,16.26 16.75,16.56C16.5,16.86 15.91,17.06 15.36,17.06C14.81,17.06 14.06,16.86 13.26,16.56C11.91,16.06 10.56,15.11 9.36,13.96C8.21,12.81 7.26,11.46 6.76,10.11C6.46,9.31 6.26,8.56 6.26,8C6.26,7.45 6.46,6.96 6.76,6.71C7.06,6.46 7.36,6.26 7.76,6.26C7.91,6.26 8.06,6.31 8.21,6.31C8.36,6.31 8.51,6.31 8.66,6.36C8.81,6.41 8.96,6.51 9.06,6.71C9.21,6.91 9.26,7.16 9.26,7.36C9.26,7.56 9.26,7.76 9.21,7.91C9.16,8.06 9.11,8.16 9,8.26C8.9,8.41 8.81,8.51 8.71,8.61C8.61,8.71 8.51,8.81 8.46,8.86C8.41,8.91 8.36,8.96 8.31,9.01C8.26,9.06 8.21,9.11 8.16,9.16C8.11,9.21 8.06,9.26 8.06,9.31C8.06,9.36 8.06,9.41 8.06,9.46C8.11,9.51 8.11,9.56 8.16,9.61C8.41,9.91 8.76,10.26 9.16,10.66C9.86,11.36 10.56,11.86 11.41,12.26C11.66,12.41 11.91,12.46 12.16,12.46C12.31,12.46 12.46,12.41 12.61,12.31C12.86,12.16 13.06,11.91 13.31,11.56C13.41,11.41 13.46,11.31 13.56,11.31C13.71,11.31 13.91,11.31 14.11,11.41C14.31,11.51 14.51,11.71 14.51,11.96C14.51,12.16 14.41,12.46 14.31,12.71C14.21,12.96 14.11,13.21 14,13.41C13.85,13.61 13.7,13.76 13.56,13.86C13.51,13.91 13.46,13.96 13.41,14.01C13.36,14.06 13.31,14.11 13.26,14.16C13.21,14.21 13.16,14.26 13.11,14.31C13.06,14.36 13.01,14.41 12.96,14.46C12.91,14.51 12.86,14.56 12.81,14.61C12.81,14.66 12.76,14.71 12.76,14.76C12.76,14.81 12.76,14.86 12.81,14.91C13.06,15.16 13.31,15.36 13.61,15.56C14.26,15.91 15,16.06 15.66,16.06C16.31,16.06 16.75,15.86 16.75,13.96M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22C13.66,22 15.31,21.5 16.75,20.66L18.41,22.31L19.81,20.91L18.16,19.21C19,17.76 19.5,16.16 19.5,14.5C19.5,8 16,4.5 12,4.5C10.76,4.5 9.56,4.81 8.56,5.31C7.56,5.81 6.81,6.56 6.31,7.56C5.81,8.56 5.5,9.76 5.5,11C5.5,12.25 5.81,13.45 6.31,14.45C6.81,15.45 7.56,16.21 8.56,16.71C9.56,17.21 10.76,17.5 12,17.5C13.31,17.5 14.5,17.16 15.5,16.5C16,16.16 16.25,15.71 16.25,15.26C16.25,14.81 16.11,14.46 15.86,14.16C15.61,13.86 15.26,13.66 14.91,13.66C14.61,13.66 14.36,13.76 14.11,13.96C13.86,14.16 13.71,14.36 13.61,14.56C13.26,15.11 12.66,15.5 12,15.5C11.16,15.5 10.41,15.21 9.86,14.66C9.31,14.11 9,13.36 9,12.5C9,11.66 9.31,10.91 9.86,10.36C10.41,9.81 11.16,9.5 12,9.5C12.81,9.5 13.5,9.81 14,10.36C14.5,10.91 14.75,11.61 14.75,12.36C14.75,12.56 14.7,12.76 14.66,12.96C14.96,13.16 15.26,13.26 15.56,13.26C15.91,13.26 16.21,13.16 16.46,12.96C16.71,12.71 16.75,12.41 16.75,12.11C16.75,11.36 16.46,10.71 15.86,10.11C15.26,9.5 14.5,9 13.61,8.71C14.5,7.86 15.21,7.21 15.71,6.71C15.96,6.46 16.16,6.21 16.31,5.96C17.21,6.86 17.76,8.06 17.76,9.5C17.76,10.95 17.21,12.15 16.21,13.1C15.21,14.05 13.96,14.5 12.5,14.5C12.26,14.5 12,14.5 11.76,14.45L12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22Z" />
    </svg>
  );

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'delivered': 'default',
    'pending': 'secondary',
    'confirmed': 'secondary',
    'in-progress': 'outline',
    'out-for-delivery': 'outline',
    'cancelled': 'destructive',
    'returned': 'destructive'
  };

export function OrderDetailsDialog({ order, isOpen, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null;

   const handleWhatsAppClick = (phone?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <ShoppingBag className="h-6 w-6 text-primary" />
            <span>Order Details</span>
          </DialogTitle>
          <DialogDescription>
            Order #{order.orderNumber.slice(-8)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            
            <div className="p-4 rounded-lg border bg-muted/20">
                <h3 className="font-semibold mb-3 text-foreground">Customer & Agent</h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="text-sm">
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-muted-foreground">Customer</div>
                            {order.customerPhone && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Phone className="h-3 w-3"/>
                                    <a href={`tel:${order.customerPhone}`} className="hover:underline">{order.customerPhone}</a>
                                     <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500 hover:text-green-600 -ml-1" onClick={() => handleWhatsAppClick(order.customerPhone)}>
                                        <WhatsAppIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="text-sm">
                            <div className="font-medium">{order.agent?.name || 'Unassigned'}</div>
                            <div className="text-muted-foreground">Delivery Agent</div>
                             {order.agent?.phone && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Phone className="h-3 w-3"/>
                                    <a href={`tel:${order.agent.phone}`} className="hover:underline">{order.agent.phone}</a>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500 hover:text-green-600 -ml-1" onClick={() => handleWhatsAppClick(order.agent?.phone)}>
                                        <WhatsAppIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
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
                    <span className="text-muted-foreground flex items-center gap-2"><Wallet className="h-4 w-4"/>Payment</span>
                    <span className="capitalize">{order.paymentMethod.replace('_', ' ')} ({order.paymentStatus})</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">Status</span>
                    <Badge variant={statusVariant[order.status]} className="text-xs capitalize">{order.status.replace('-', ' ')}</Badge>
                </div>
                {(order.status === 'cancelled' || order.status === 'returned') && order.adminNotes && (
                   <div className="flex justify-between items-start pt-2">
                        <span className="text-muted-foreground flex items-center gap-2"><XCircle className="h-4 w-4"/>Reason</span>
                        <span className="text-right text-destructive text-sm font-medium">{order.adminNotes}</span>
                    </div>
                )}
            </div>

            <Separator />
            
            <div>
                <h4 className="font-semibold mb-2 text-foreground">Items</h4>
                <div className="space-y-2">
                {order.items.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-md bg-muted/40 text-sm">
                        <div>
                            <span>{p.productName}</span>
                            <span className="text-muted-foreground ml-2 text-xs">({p.variantLabel})</span>
                        </div>
                        <span className="text-muted-foreground">x{p.quantity}</span>
                    </div>
                ))}
                </div>
            </div>
            
            <Separator />

            <div className="flex justify-between items-center font-bold text-lg p-3 bg-primary/10 rounded-lg">
                <span className="text-primary">Total Amount</span>
                <span className="flex items-center text-primary"><IndianRupee className="h-5 w-5" />{parseFloat(order.totalAmount).toLocaleString()}</span>
            </div>
        </div>
        {(order.status === 'in-progress' || order.status === 'out-for-delivery') && (
             <DialogFooter className="mt-4">
                <Button asChild className="w-full">
                    <Link href={`/track/${order.id}`}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Track Order
                    </Link>
                </Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
