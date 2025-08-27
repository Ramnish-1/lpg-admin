
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Product } from '@/lib/types';
import { History } from 'lucide-react';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineTitle, TimelineIcon, TimelineDescription } from './timeline';


interface ProductHistoryDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dummy history data
const historyData = [
    { change: 'Price updated to ₹1150', user: 'Admin', date: '2024-05-15' },
    { change: 'Stock increased by 50 units', user: 'Admin', date: '2024-05-10' },
    { change: 'Product created', user: 'Admin', date: '2024-04-01' },
]

export function ProductHistoryDialog({ product, isOpen, onOpenChange }: ProductHistoryDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <span>{product.name} History</span>
          </DialogTitle>
          <DialogDescription>
            Change log for this product.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <p className="text-center text-muted-foreground">Feature coming soon.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
