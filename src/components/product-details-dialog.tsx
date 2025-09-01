
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { IndianRupee, Package, PackageCheck, AlertCircle, Info, Beaker, Image as ImageIcon } from 'lucide-react';
import { Separator } from './ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import Image from 'next/image';

interface ProductDetailsDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';


export function ProductDetailsDialog({ product, isOpen, onOpenChange }: ProductDetailsDialogProps) {
  if (!product) return null;

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isLowStock = totalStock < product.lowStockThreshold;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span>{product.productName}</span>
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="space-y-4 pt-2">
            
            {product.images && product.images.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Images</h3>
                     <Carousel className="w-full max-w-xs mx-auto">
                      <CarouselContent>
                        {product.images.map((img, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                               <div className="relative aspect-square">
                                 <Image 
                                    src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`} 
                                    alt={`${product.productName} image ${index + 1}`}
                                    layout="fill"
                                    className="rounded-md object-cover"
                                    data-ai-hint="gas cylinder"
                                />
                               </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                </div>
            )}

          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm">{product.description}</p>
          </div>
          
          <Separator/>

          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Beaker className="h-4 w-4"/> Variants</h3>

          <div className="space-y-2">
            {product.variants.map((variant, index) => (
              <div key={index} className="p-3 rounded-md border text-sm space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>{variant.label}</span>
                  <span>₹{variant.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Stock</span>
                  <span>{variant.stock} units</span>
                </div>
              </div>
            ))}
          </div>

          <Separator/>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><PackageCheck className="h-4 w-4"/>Total Stock</span>
            <div className="flex items-center gap-2 font-medium">
              <span>{totalStock}</span>
              {isLowStock && (
                <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                  <AlertCircle className="h-3 w-3" /> Low
                </Badge>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4"/>Low Stock Alert Threshold</span>
            <span className="font-medium">{product.lowStockThreshold} units</span>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
