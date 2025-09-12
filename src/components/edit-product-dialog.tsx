
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
import { PlusCircle, Trash2, X, ImagePlus, ChevronDown } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { ImageViewerDialog } from './image-viewer-dialog';
import { useAuth } from '@/context/auth-context';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

interface EditProductDialogProps {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdate: (product: Product, imagesToDelete?: string[], newImages?: File[]) => Promise<boolean>;
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
  agencyIds: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function EditProductDialog({ product, isOpen, onOpenChange, onProductUpdate }: EditProductDialogProps) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token, handleApiError } = useAuth();


  const fetchAgencies = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        setAgencies(result.data.agencies);
      }
    } catch (e) {
      console.error("Failed to fetch agencies");
    }
  }


  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      variants: [{ label: '', price: 0, stock: 0 }],
      agencyIds: [],
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
       if (agencies.length === 0) {
            fetchAgencies();
       }
      form.reset({
        ...product,
        category: product.category || 'lpg',
        agencyIds: product.agencies?.map(a => a.id!) || [],
      });
      setImagePreviews(product.images || []);
      setImagesToDelete([]);
      setNewImageFiles([]);
    }
  }, [product, isOpen, form, agencies.length]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  }

  const handleSubmit = async (values: ProductFormValues) => {
    const updatedProduct: Product = {
      ...product,
      ...values,
      images: imagePreviews.filter(img => !img.startsWith('blob:')), // Only keep existing images
    };
    
    const success = await onProductUpdate(updatedProduct, imagesToDelete, newImageFiles);
    if(success) {
      handleOpenChange(false);
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
    
    // If it's an existing image (http URL), add it to imagesToDelete
    if (imageToRemove.startsWith('http')) {
        setImagesToDelete(prev => [...prev, imageToRemove]);
    } else { // If it's a new blob image, remove it from newImageFiles
        const blobUrlIndex = imagePreviews.filter(p => p.startsWith("blob:")).findIndex(p => p === imageToRemove);
        if (blobUrlIndex > -1) {
            setNewImageFiles(prev => prev.filter((_, i) => i !== blobUrlIndex));
        }
    }
    
    // Remove from previews
    setImagePreviews(previews => previews.filter((_, i) => i !== indexToRemove));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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

                       <FormField
                        control={form.control}
                        name="agencyIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agencies</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between font-normal"
                                  >
                                    <span className="truncate">
                                      {field.value && field.value.length > 0
                                        ? `${field.value.length} selected`
                                        : "Select agencies"}
                                    </span>
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                  <CommandInput placeholder="Search agencies..." />
                                  <CommandEmpty>No agencies found.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandList>
                                      {agencies.map((agency) => (
                                        <CommandItem
                                          key={agency.id}
                                          onSelect={() => {
                                            const selected = field.value || [];
                                            const isSelected = selected.includes(agency.id!);
                                            const newSelection = isSelected
                                              ? selected.filter((id) => id !== agency.id)
                                              : [...selected, agency.id!];
                                            field.onChange(newSelection);
                                          }}
                                          className="flex items-center gap-2"
                                        >
                                          <Checkbox checked={field.value?.includes(agency.id!)} />
                                          <span>{agency.name}</span>
                                        </CommandItem>
                                      ))}
                                    </CommandList>
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                             {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                {agencies.filter(a => field.value?.includes(a.id!)).map(agency => (
                                    <Badge key={agency.id} variant="secondary">{agency.name}</Badge>
                                ))}
                                </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                                src={src.startsWith('http') || src.startsWith('blob:') ? src : `${API_BASE_URL}${src}`} 
                                                alt={`Preview ${index + 1}`} 
                                                fill
                                                className="rounded-md object-cover cursor-pointer"
                                                onClick={() => openImageViewer(src.startsWith('http') || src.startsWith('blob:') ? src : `${API_BASE_URL}${src}`)}
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

    