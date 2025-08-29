
"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditProductDialogProps {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdate: (product: Product) => void;
}

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  unit: z.string().min(1, "Unit is required."),
  description: z.string().min(1, "Description is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  stock: z.coerce.number().int().min(0, "Stock must be a whole number."),
  lowStockThreshold: z.coerce.number().int().min(0, "Threshold must be a whole number."),
  status: z.enum(['active', 'inactive', 'Active', 'Inactive']),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function EditProductDialog({ product, isOpen, onOpenChange, onProductUpdate }: EditProductDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...product,
      status: product.status.toLowerCase() as 'active' | 'inactive'
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        ...product,
        price: product.price ?? undefined,
        stock: product.stock ?? undefined,
        lowStockThreshold: product.lowStockThreshold ?? undefined,
        status: product.status.toLowerCase() as 'active' | 'inactive'
      });
    }
  }, [product, isOpen, form]);

  const handleSubmit = (values: ProductFormValues) => {
    const updatedProduct = {
      ...product,
      ...values,
      status: values.status as 'active' | 'inactive',
    };
    onProductUpdate(updatedProduct);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset(product);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for {product.productName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. LPG Cylinder" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 14.2kg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. Commercial cylinder for restaurants" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 1100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value.toLowerCase()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
