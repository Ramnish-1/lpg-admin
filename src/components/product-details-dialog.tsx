
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { IndianRupee, Package, PackageCheck, AlertCircle, Info, Beaker } from 'lucide-react';
import { Separator } from './ui/separator';

interface ProductDetailsDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDialog({ product, isOpen, onOpenChange }: ProductDetailsDialogProps) {
  if (!product) return null;

  const isLowStock = product.stock < product.lowStockThreshold;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span>{product.name}</span>
          </DialogTitle>
          <DialogDescription>
            Details for product ID #{product.id.slice(0, 6)}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm">{product.description}</p>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><Beaker className="h-4 w-4"/>Unit</span>
            <span className="font-medium">{product.unit}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><IndianRupee className="h-4 w-4"/>Price</span>
            <span className="font-medium">₹{product.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><PackageCheck className="h-4 w-4"/>Current Stock</span>
            <div className="flex items-center gap-2 font-medium">
              <span>{product.stock}</span>
              {isLowStock && (
                <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                  <AlertCircle className="h-3 w-3" /> Low
                </Badge>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4"/>Low Stock Alert</span>
            <span className="font-medium">{product.lowStockThreshold} units</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
