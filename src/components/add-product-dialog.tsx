
"use client";

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
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
import Image from 'next/image';

type AddProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'history'>;

interface AddProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdd: (product: AddProductPayload, images: FileList) => Promise<boolean>;
}

const variantSchema = z.object({
  label: z.string().min(1, "Label is required."),
  price: z.coerce.number().min(0, "Price must be positive."),
  stock: z.coerce.number().int().min(0, "Stock must be a whole number."),
});

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  description: z.string().min(1, "Description is required."),
  lowStockThreshold: z.coerce.number().int().min(0, "Threshold must be a whole number."),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function AddProductDialog({ isOpen, onOpenChange, onProductAdd }: AddProductDialogProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      description: '',
      lowStockThreshold: 10,
      variants: [{ label: '', price: undefined, stock: undefined }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });
  
  const handleSubmit = async (values: ProductFormValues) => {
    if (!imageFiles || imageFiles.length === 0) {
      form.setError("root", { message: "At least one image is required." });
      return;
    }

    const payload = { ...values, status: 'active' as const, images: [] };
    const success = await onProductAdd(payload, imageFiles);
    
    if (success) {
      form.reset();
      setImagePreviews([]);
      setImageFiles(null);
      onOpenChange(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setImagePreviews([]);
      setImageFiles(null);
    }
    onOpenChange(open);
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        setImageFiles(files);
        const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
    }
  };
  
  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    if (imageFiles) {
        const dt = new DataTransfer();
        const files = Array.from(imageFiles);
        files.splice(index, 1);
        files.forEach(file => dt.items.add(file));
        setImageFiles(dt.files);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new product, including its variants and images.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="productName" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g. LPG Cylinder" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (<FormItem><FormLabel>Low Stock Threshold</FormLabel><FormControl><Input type="number" placeholder="e.g. 10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g. Standard household cooking gas cylinder" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    
                    <div>
                        <FormLabel>Product Variants</FormLabel>
                        <div className="space-y-4 mt-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-start gap-2 p-3 border rounded-md relative">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                        <FormField control={form.control} name={`variants.${index}.label`} render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input placeholder="e.g. 14.2kg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" placeholder="1100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (<FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" placeholder="150" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="shrink-0 -mt-1 -mr-1" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ label: '', price: undefined, stock: undefined })}><PlusCircle className="mr-2 h-4 w-4"/>Add Variant</Button>
                        <FormMessage>{form.formState.errors.variants?.message || form.formState.errors.variants?.root?.message}</FormMessage>
                    </div>

                    <div>
                      <FormLabel>Product Images</FormLabel>
                       <FormControl>
                          <Input id="image-upload" type="file" multiple onChange={handleImageChange} className="mt-2" accept="image/*"/>
                       </FormControl>
                      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {imagePreviews.map((src, index) => (
                          <div key={index} className="relative aspect-square">
                            <Image src={src} alt={`Preview ${index + 1}`} layout="fill" className="rounded-md object-cover"/>
                            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(index)}><X className="h-4 w-4"/></Button>
                          </div>
                        ))}
                      </div>
                      <FormMessage>{form.formState.errors.root?.message}</FormMessage>
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-4 mt-4 border-t bg-muted/40">
               <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Adding...' : 'Add Product'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
