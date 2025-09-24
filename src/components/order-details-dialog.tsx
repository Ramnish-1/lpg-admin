
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

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmAndAssign: (order: Order) => void;
  onCancelOrder: (order: Order) => void;
  isUpdating: boolean;
}

export function OrderDetailsDialog({ order, isOpen, onOpenChange, onConfirmAndAssign, onCancelOrder, isUpdating }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          {/* The content is now in a separate component */}
      </DialogContent>
    </Dialog>
  );
}
