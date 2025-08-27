
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@/lib/types';

interface EditProductDialogProps {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdate: (product: Product) => void;
}

export function EditProductDialog({ product, isOpen, onOpenChange, onProductUpdate }: EditProductDialogProps) {
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);

  useEffect(() => {
    if (isOpen) {
      setPrice(product.price);
      setStock(product.stock);
    }
  }, [product, isOpen]);

  const handleSubmit = () => {
    const updatedProduct = {
      ...product,
      price: Number(price),
      stock: Number(stock),
    };
    onProductUpdate(updatedProduct);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update price and stock for {product.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (₹)
            </Label>
            <Input 
              id="price" 
              type="number"
              value={price} 
              onChange={(e) => setPrice(Number(e.target.value))} 
              className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Stock
            </Label>
            <Input 
              id="stock" 
              type="number"
              value={stock} 
              onChange={(e) => setStock(Number(e.target.value))} 
              className="col-span-3" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
