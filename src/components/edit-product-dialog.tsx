
"use client";

import { useEffect, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { ImageViewerDialog } from './image-viewer-dialog';

interface EditProductDialogProps {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdate: (product: Product, images?: FileList) => void;
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
  status: z.enum(['active', 'inactive']),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
});

type ProductFormValues = z.infer<typeof productSchema>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function EditProductDialog({ product, isOpen, onOpenChange, onProductUpdate }: EditProductDialogProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        ...product,
        status: product.status.toLowerCase() as 'active' | 'inactive',
      });
      setImagePreviews(product.images.map(img => img.startsWith('http') ? img : `${API_BASE_URL}${img}`));
      setImageFiles(null);
    }
  }, [product, isOpen, form]);
  
  const handleSubmit = (values: ProductFormValues) => {
    const updatedProduct = {
      ...product,
      ...values,
      status: values.status as 'active' | 'inactive',
      images: [], // Images are handled separately via FormData
    };
    onProductUpdate(updatedProduct, imageFiles || undefined);
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        setImageFiles(files);
        const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
    }
  };
  
  const openImageViewer = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsViewerOpen(true);
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the details for {product.productName}.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 py-2">
                      <FormField control={form.control} name="productName" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (<FormItem><FormLabel>Low Stock Threshold</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value.toLowerCase()}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      </div>

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
                          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ label: '', price: 0, stock: 0 })}><PlusCircle className="mr-2 h-4 w-4"/>Add Variant</Button>
                          <FormMessage>{form.formState.errors.variants?.message || form.formState.errors.variants?.root?.message}</FormMessage>
                      </div>

                      <div>
                        <FormLabel>Product Images</FormLabel>
                        <FormControl>
                            <Input id="image-upload-edit" type="file" multiple onChange={handleImageChange} className="mt-2" accept="image/*"/>
                        </FormControl>
                         {imagePreviews.length > 0 && (
                            <Carousel className="w-full mt-4">
                                <CarouselContent className="-ml-2">
                                    {imagePreviews.map((src, index) => (
                                    <CarouselItem key={src} className="pl-2 basis-1/3 md:basis-1/4 lg:basis-1/5">
                                        <div className="relative aspect-square group">
                                            <Image 
                                                src={src} 
                                                alt={`Preview ${index + 1}`} 
                                                layout="fill" 
                                                className="rounded-md object-cover cursor-pointer"
                                                onClick={() => openImageViewer(src)}
                                            />
                                            {/* The remove button is disabled in edit mode to prevent accidental removal of existing images. A more robust solution would be needed to handle deletes. */}
                                        </div>
                                    </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">Uploading new images will replace all existing ones for this product.</p>
                      </div>

                  </div>
              </ScrollArea>
              <DialogFooter className="p-6 pt-4 mt-4 border-t bg-muted/40">
                <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ImageViewerDialog 
        isOpen={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        imageUrl={selectedImageUrl}
      />
    </>
  );
}

    