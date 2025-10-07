

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
import { CategoryDropdown } from './category-dropdown';
import { TagsInput } from './tags-input';

// Updated to support dynamic categories
type AddProductPayload = Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images' | 'AgencyInventory'>;

interface AddProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdd: (product: AddProductPayload, images: File[]) => Promise<boolean>;
}

const variantSchema = z.object({
  value: z.coerce.number().min(0.01, "Value is required and must be greater than 0."),
  unit: z.enum(['kg', 'meter']),
  price: z.coerce.number().min(0.01, "Base price is required and must be greater than 0."),
});

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  description: z.string().min(1, "Description is required."),
  category: z.string().min(1, "Category is required."),
  lowStockThreshold: z.coerce.number().int().min(0, "Threshold must be a whole number."),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
  tags: z.array(z.string()).default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function AddProductDialog({ isOpen, onOpenChange, onProductAdd }: AddProductDialogProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageDropzoneRef = useRef<HTMLDivElement>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      description: '',
      category: '',
      lowStockThreshold: 10,
      variants: [{ value: '' as any, unit: 'kg', price: '' as any }],
      tags: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const resetDialog = () => {
    form.reset({
        productName: '',
        description: '',
        category: '',
        lowStockThreshold: 10,
        variants: [{ value: '' as any, unit: 'kg', price: '' as any }],
        tags: [],
    });
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSubmitting(false);
  }

  const handleSubmit = async (values: ProductFormValues) => {
    if (imageFiles.length === 0) {
      form.setError("root", { message: "At least one image is required." });
      imageDropzoneRef.current?.focus();
      return;
    }
    form.clearErrors("root");
    
    setIsSubmitting(true);
    
    const payload: AddProductPayload = {
      ...values,
      variants: values.variants.map(v => ({
        ...v,
        label: `${v.value}${v.unit}`,
        stock: 0, // Stock is managed at agency level
      })),
    };

    try {
        const success = await onProductAdd(payload, imageFiles);
        if (success) {
          resetDialog();
          onOpenChange(false);
        }
    } finally {
        setIsSubmitting(false);
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
                            <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="e.g. LPG Cylinder" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category <span className="text-red-500">*</span></FormLabel><FormControl><CategoryDropdown value={field.value} onValueChange={field.onChange} placeholder="Select a category" /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (<FormItem><FormLabel>Global Low Stock Threshold</FormLabel><FormControl><Input type="number" placeholder="e.g. 10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description <span className="text-red-500">*</span></FormLabel><FormControl><Textarea placeholder="e.g. Standard household cooking gas cylinder" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      
                      <FormField control={form.control} name="tags" render={({ field }) => (<FormItem><FormLabel>Product Tags</FormLabel><FormControl><TagsInput value={field.value} onChange={field.onChange} placeholder="e.g. premium, fast-delivery, eco-friendly" /></FormControl><FormMessage /></FormItem>)} />
                      
                      <div>
                          <FormLabel>Default Product Variants <span className="text-red-500">*</span></FormLabel>
                          <div className="space-y-4 mt-2">
                              {fields.map((field, index) => (
                                  <div key={field.id} className="flex items-start gap-2 p-3 border rounded-md relative">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                          <FormField control={form.control} name={`variants.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value <span className="text-red-500">*</span></FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g. 14.2" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                          <FormField control={form.control} name={`variants.${index}.unit`} render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="meter">meter</SelectItem></SelectContent></Select><FormMessage/></FormItem>)} />
                                          <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (<FormItem><FormLabel>Base Price (₹) <span className="text-red-500">*</span></FormLabel><FormControl><Input type="number" step="0.01" placeholder="1100" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                      </div>
                                      <Button type="button" variant="ghost" size="icon" className="shrink-0 mt-8 -mr-1" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                  </div>
                              ))}
                          </div>
                          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: '' as any, unit: 'kg', price: '' as any })}><PlusCircle className="mr-2 h-4 w-4"/>Add Variant</Button>
                          <FormMessage>{form.formState.errors.variants?.message || form.formState.errors.variants?.root?.message}</FormMessage>
                      </div>

                      <div>
                          <FormLabel>Product Images <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <div >
                                <input ref={fileInputRef} id="image-upload" type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*"/>
                                <div
                                    ref={imageDropzoneRef}
                                    tabIndex={0}
                                    className="mt-2 flex justify-center items-center flex-col w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onClick={() => fileInputRef.current?.click()}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()}}
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
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Product'}</Button>
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

