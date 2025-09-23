
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Product, AgencyInventory } from '@/lib/types';
import { IndianRupee, Package, PackageCheck, AlertCircle, Info, Beaker, Image as ImageIcon } from 'lucide-react';
import { Separator } from './ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';

interface ProductDetailsDialogProps {
  item: Product | AgencyInventory | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';


export function ProductDetailsDialog({ item, isOpen, onOpenChange, isAdmin }: ProductDetailsDialogProps) {
  if (!item) return null;

  const product = 'productName' in item ? item : item.Product;
  const inventory = 'agencyId' in item ? item : null;
  
  const safeVariants = Array.isArray(inventory?.agencyVariants) && inventory.agencyVariants.length > 0 
    ? inventory.agencyVariants 
    : Array.isArray(product.variants) ? product.variants : [];
    
  const totalStock = inventory 
    ? inventory.stock
    : product.AgencyInventory?.reduce((acc, inv) => acc + inv.stock, 0) ?? 0;
    
  const lowStockThreshold = inventory ? inventory.lowStockThreshold : product.lowStockThreshold;
  const isLowStock = totalStock < lowStockThreshold;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span>{product.productName}</span>
          </DialogTitle>
          <DialogDescription>
            {product.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
           {product.images && product.images.length > 0 && (
              <Carousel className="w-full">
                <CarouselContent className="-ml-2">
                  {product.images.map((img, index) => (
                    <CarouselItem key={index} className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/5">
                      <div className="relative aspect-square group">
                            <Image 
                              src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`} 
                              alt={`${product.productName} image ${index + 1}`}
                              fill
                              className="rounded-md object-cover"
                              data-ai-hint="gas cylinder"
                          />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {product.images.length > 5 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            )}

            <Card>
              <CardContent className="pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Beaker className="h-4 w-4"/> {inventory ? "Agency Variants & Pricing" : "Default Variants"}</h3>
                   <div className="space-y-2">
                      {safeVariants.map((variant, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/40 text-sm">
                          <span className="font-semibold">{variant.label}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">Stock: {variant.stock}</span>
                            <span className="font-medium">₹{variant.price.toLocaleString()}</span>
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
                        <span className="text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4"/>Low Stock Alert</span>
                        <span className="font-medium">{lowStockThreshold} units</span>
                      </div>
              </CardContent>
            </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
