
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { OrderDetailsView } from './order-details-view';
import type { Order } from '@/lib/types';
import { useEffect, useState } from 'react';

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmAndAssign: (order: Order) => void;
  onCancelOrder: (order: Order) => void;
  isUpdating: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export function OrderDetailsDialog({ order: initialOrder, isOpen, onOpenChange }: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<Order | null>(initialOrder);

  useEffect(() => {
     if (isOpen && initialOrder?.id && (!order || order.id !== initialOrder.id)) {
      const fetchOrder = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/orders/${initialOrder.id}`, {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              // Add auth token if needed
            }
          });
          const result = await response.json();
          if (result.success) {
            setOrder(result.data.order);
          }
        } catch (error) {
          console.error("Failed to fetch latest order details", error);
          setOrder(initialOrder); // fallback to initial
        }
      };
      fetchOrder();
    } else if (initialOrder) {
       setOrder(initialOrder);
    }
  }, [isOpen, initialOrder, order]);


  const handleUpdate = async () => {
     if (!order) return;
     try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}`, {
             headers: {
              'ngrok-skip-browser-warning': 'true',
              // Add auth token if needed
            }
        });
        const result = await response.json();
        if (result.success) {
          setOrder(result.data.order);
        }
      } catch (error) {
        console.error("Failed to refetch latest order details", error);
      }
  }


  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
         <OrderDetailsView order={order} onUpdate={handleUpdate} />
      </DialogContent>
    </Dialog>
  );
}
