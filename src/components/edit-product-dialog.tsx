
"use client";

import { useEffect, useState, useRef } from 'react';
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
import { Product, Agency } from '@/lib/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PlusCircle, Trash2, X, ImagePlus } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { ImageViewerDialog } from './image-viewer-dialog';

interface EditProductDialogProps {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdate: (product: Product) => Promise<boolean>;
}

const variantSchema = z.object({
  label: z.string().min(1, "Label is required."),
  price: z.coerce.number().min(0, "Price must be positive."),
  stock: z.coerce.number().int().min(0, "Stock must be a whole number."),
});

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  description: z.string().min(1, "Description is required."),
  category: z.enum(['lpg', 'accessories']),
  lowStockThreshold: z.coerce.number().int().min(0, "Threshold must be a whole number."),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function EditProductDialog({ product, isOpen, onOpenChange, onProductUpdate }: EditProductDialogProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      variants: [{ label: '', price: 0, stock: 0 }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  useEffect(() => {
    if (isOpen && product) {
      form.reset({
        ...product,
        category: product.category || 'lpg',
      });
      setImagePreviews(product.images || []);
    }
  }, [product, isOpen, form]);

  const handleSubmit = async (values: ProductFormValues) => {
    const updatedProduct: Product = {
      ...product,
      ...values,
      images: imagePreviews,
    };
    
    const success = await onProductUpdate(updatedProduct);
    if(success) {
      onOpenChange(false);
    }
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const newFilePreviews = Array.from(files).map(file => URL.createObjectURL(file));
        setImagePreviews(prevPreviews => [...prevPreviews, ...newFilePreviews]);
    }
  };

  const openImageViewer = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsViewerOpen(true);
  };
  
  const removeImage = (indexToRemove: number) => {
    setImagePreviews(previews => previews.filter((_, i) => i !== indexToRemove));
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
                          <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="lpg">LPG</SelectItem><SelectItem value="accessories">Accessories</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (<FormItem><FormLabel>Low Stock Threshold</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>

                      <div>
                          <FormLabel>Product Variants</FormLabel>
                          <div className="space-y-4 mt-2">
                              {fields.map((field, index) => (
                                  <div key={field.id} className="flex items-start gap-2 p-3 border rounded-md relative">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                          <FormField control={form.control} name={`variants.${index}.label`} render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input placeholder="Unit" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                            <div>
                                <input ref={fileInputRef} id="image-upload-edit" type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*"/>
                                <div
                                    className="mt-2 flex justify-center items-center flex-col w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImagePlus className="h-8 w-8 text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground mt-2">Click or drag to add images</p>
                                </div>
                            </div>
                          </FormControl>
                         {imagePreviews.length > 0 && (
                            <Carousel className="w-full mt-4">
                                <CarouselContent className="-ml-2">
                                    {imagePreviews.map((src, index) => (
                                    <CarouselItem key={src} className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/5">
                                        <div className="relative aspect-square group">
                                            <Image 
                                                src={src} 
                                                alt={`Preview ${index + 1}`} 
                                                fill
                                                className="rounded-md object-cover cursor-pointer"
                                                onClick={() => openImageViewer(src)}
                                            />
                                            <Button 
                                                type="button" 
                                                variant="destructive" 
                                                size="icon" 
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                onClick={(e) => { e.stopPropagation(); removeImage(index);}}
                                            >
                                                <X className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">Add new images or remove existing ones.</p>
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
