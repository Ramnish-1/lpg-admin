
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
import { PlusCircle, Trash2, X, ImagePlus } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { ImageViewerDialog } from './image-viewer-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type AddProductPayload = Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images' | 'AgencyInventory'>;

interface AddProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdd: (product: AddProductPayload, images: File[]) => Promise<boolean>;
}

const variantSchema = z.object({
  label: z.string().min(1, "Label is required"),
  price: z.coerce.number().min(0, "Price must be positive."),
  stock: z.coerce.number().int().min(0, "Stock must be a whole number.").optional(),
});

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  description: z.string().min(1, "Description is required."),
  category: z.enum(['lpg', 'accessories']),
  lowStockThreshold: z.coerce.number().int().min(0, "Threshold must be a whole number."),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function AddProductDialog({ isOpen, onOpenChange, onProductAdd }: AddProductDialogProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      description: '',
      category: 'lpg',
      lowStockThreshold: 10,
      variants: [{ label: '', price: '' as any, stock: 0 }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const resetDialog = () => {
    form.reset();
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleSubmit = async (values: ProductFormValues) => {
    if (imageFiles.length === 0) {
      form.setError("root", { message: "At least one image is required." });
      return;
    }

    const payload: AddProductPayload = {
      ...values,
      variants: values.variants.map(v => ({
        label: v.label,
        price: v.price,
        stock: v.stock || 0,
      })),
    };
    const success = await onProductAdd(payload, imageFiles);
    
    if (success) {
      resetDialog();
      onOpenChange(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const newFiles = Array.from(files);
        setImageFiles(prev => [...prev, ...newFiles]);
        const newFilePreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prevPreviews => [...prevPreviews, ...newFilePreviews]);
    }
  };
  
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
        const newPreviews = [...prev];
        URL.revokeObjectURL(newPreviews[index]); // Clean up memory
        newPreviews.splice(index, 1);
        return newPreviews;
    });
  }
  
  const openImageViewer = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsViewerOpen(true);
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Add New Global Product</DialogTitle>
            <DialogDescription>
              Enter details for a new product to be added to the catalog.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 py-2">
                     <FormField
                        control={form.control}
                        name="productName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl><Input placeholder="e.g. LPG Cylinder" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="lpg">LPG</SelectItem><SelectItem value="accessories">Accessories</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (<FormItem><FormLabel>Global Low Stock Threshold</FormLabel><FormControl><Input type="number" placeholder="e.g. 10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g. Standard household cooking gas cylinder" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      
                      <div>
                          <FormLabel>Default Product Variants</FormLabel>
                          <div className="space-y-4 mt-2">
                              {fields.map((field, index) => (
                                  <div key={field.id} className="flex items-start gap-2 p-3 border rounded-md relative">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                                          <FormField control={form.control} name={`variants.${index}.label`} render={({ field }) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input placeholder="e.g. 14.2kg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                          <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (<FormItem><FormLabel>Base Price (₹)</FormLabel><FormControl><Input type="number" placeholder="1100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                      </div>
                                      <Button type="button" variant="ghost" size="icon" className="shrink-0 -mt-1 -mr-1" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                  </div>
                              ))}
                          </div>
                          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ label: '', price: '' as any, stock: 0 })}><PlusCircle className="mr-2 h-4 w-4"/>Add Variant</Button>
                          <FormMessage>{form.formState.errors.variants?.message || form.formState.errors.variants?.root?.message}</FormMessage>
                      </div>

                      <div>
                          <FormLabel>Product Images</FormLabel>
                          <FormControl>
                            <div >
                                <input ref={fileInputRef} id="image-upload" type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*"/>
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
                                      <CarouselItem key={index} className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/5">
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
      <ImageViewerDialog 
        isOpen={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        imageUrl={selectedImageUrl}
      />
    </>
  );
}
