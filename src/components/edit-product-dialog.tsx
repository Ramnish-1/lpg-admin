

"use client";

import { useEffect, useState, useRef, useContext } from 'react';
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
import { Product, ProductVariant } from '@/lib/types';
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
import { ProfileContext } from '@/context/profile-context';
import { cn } from '@/lib/utils';

type EditProductPayload = Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images' | 'AgencyInventory'> & { id: string };

interface EditProductDialogProps {
  item: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdate: (product: EditProductPayload, imagesToDelete?: string[], newImages?: File[]) => Promise<boolean>;
  onInventoryUpdate: (inventoryData: any) => Promise<boolean>;
  isAdmin: boolean;
}

const variantSchema = z.object({
  value: z.coerce.number().min(0, "Value must be a positive number."),
  unit: z.enum(['kg', 'meter']),
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function EditProductDialog({ item: product, isOpen, onOpenChange, onProductUpdate, onInventoryUpdate, isAdmin }: EditProductDialogProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useContext(ProfileContext);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      variants: [{ value: '' as any, unit: 'kg', price: '' as any, stock: '' as any }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });
  
  const resetState = () => {
    form.reset();
    setImagePreviews([]);
    setImagesToDelete([]);
    setNewImageFiles([]);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  useEffect(() => {
    if (isOpen && product) {
        let variantsToShow: Partial<ProductVariant>[] = product.variants;
        let thresholdToShow = product.lowStockThreshold;

        if (!isAdmin) {
            const agencyInventory = product.AgencyInventory?.find(inv => inv.agencyId === profile.agencyId);
            if (agencyInventory && agencyInventory.agencyVariants.length > 0) {
                variantsToShow = agencyInventory.agencyVariants;
                thresholdToShow = agencyInventory.lowStockThreshold;
            }
        }
        
        form.reset({
            ...product,
            category: product.category || 'lpg',
            variants: variantsToShow.map(v => ({...v, value: parseFloat(v.label), unit: v.label.endsWith('kg') ? 'kg' : 'meter' })),
            lowStockThreshold: thresholdToShow
        });
        setImagePreviews(product.images || []);
        setImagesToDelete([]);
        setNewImageFiles([]);
    }
  }, [product, isOpen, form, isAdmin, profile.agencyId]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  }

  const handleSubmit = async (values: ProductFormValues) => {
     if (isAdmin) {
        const payload: EditProductPayload = {
            ...values,
            variants: values.variants.map(v => ({
              ...v,
              label: `${v.value}${v.unit}`,
            })),
            id: product.id,
        };
        const success = await onProductUpdate(payload, imagesToDelete, newImageFiles);
        if(success) {
            handleOpenChange(false);
        }
    } else {
        const inventoryData = {
          lowStockThreshold: values.lowStockThreshold,
          variants: values.variants.map(v => ({...v, label: `${v.value}${v.unit}`})),
        };
        const success = await onInventoryUpdate(inventoryData);
        if(success) handleOpenChange(false);
    }
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const newFiles = Array.from(files);
        setNewImageFiles(prev => [...prev, ...newFiles]);

        const newFilePreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prevPreviews => [...prevPreviews, ...newFilePreviews]);
    }
  };

  const openImageViewer = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsViewerOpen(true);
  };
  
  const removeImage = (indexToRemove: number) => {
    const imageToRemove = imagePreviews[indexToRemove];
    
    if (imageToRemove.startsWith('http') || imageToRemove.startsWith('/uploads')) {
        setImagesToDelete(prev => [...prev, imageToRemove]);
    } else { 
        const blobUrlIndex = imagePreviews.filter(p => p.startsWith("blob:")).findIndex(p => p === imageToRemove);
        if (blobUrlIndex > -1) {
            setNewImageFiles(prev => prev.filter((_, i) => i !== blobUrlIndex));
        }
    }
    
    setImagePreviews(previews => previews.filter((_, i) => i !== indexToRemove));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Edit {isAdmin ? 'Global Product' : 'Agency Inventory'}</DialogTitle>
            <DialogDescription>Update the details for {product.productName}.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 py-2">
                      <FormField control={form.control} name="productName" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} disabled={!isAdmin} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} disabled={!isAdmin} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="lpg">LPG</SelectItem><SelectItem value="accessories">Accessories</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (<FormItem><FormLabel>Low Stock Threshold</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>

                      <div>
                          <FormLabel>{isAdmin ? 'Default Variants' : 'Agency Variants'}</FormLabel>
                          <div className="space-y-4 mt-2">
                              {fields.map((field, index) => (
                                  <div key={field.id} className="flex items-start gap-2 p-3 border rounded-md relative">
                                       <div className={cn("grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1", { "sm:grid-cols-3": isAdmin })}>
                                          <FormField control={form.control} name={`variants.${index}.value`} render={({ field }) => (<FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" placeholder="e.g. 14.2" {...field} disabled={!isAdmin} /></FormControl><FormMessage /></FormItem>)} />
                                          <FormField control={form.control} name={`variants.${index}.unit`} render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="meter">meter</SelectItem></SelectContent></Select><FormMessage/></FormItem>)} />
                                          <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" placeholder="1100" {...field} disabled={!isAdmin} /></FormControl><FormMessage /></FormItem>)} />
                                          {!isAdmin && (
                                            <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (<FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" placeholder="150" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                          )}
                                      </div>
                                      {isAdmin && (
                                        <Button type="button" variant="ghost" size="icon" className="shrink-0 mt-8 -mr-1" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                      )}
                                  </div>
                              ))}
                          </div>
                          {isAdmin && (
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: '' as any, unit: 'kg', price: '' as any, stock: '' as any })}><PlusCircle className="mr-2 h-4 w-4"/>Add Variant</Button>
                          )}
                          <FormMessage>{form.formState.errors.variants?.message || form.formState.errors.variants?.root?.message}</FormMessage>
                      </div>

                      {isAdmin && (
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
                                                  src={src.startsWith('http') || src.startsWith('blob:') ? src : `${API_BASE_URL}/${src}`} 
                                                  alt={`Preview ${index + 1}`} 
                                                  fill
                                                  className="rounded-md object-cover cursor-pointer"
                                                  onClick={() => openImageViewer(src.startsWith('http') || src.startsWith('blob:') ? src : `${API_BASE_URL}/${src}`)}
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
                      )}

                  </div>
              </ScrollArea>
              <DialogFooter className="p-6 pt-4 mt-4 border-t bg-muted/40">
                <DialogClose asChild><Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
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

