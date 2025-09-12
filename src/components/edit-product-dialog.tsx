

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
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

interface EditProductDialogProps {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdate: (product: Product, newImageFilesAsBase64: string[]) => void;
}

const variantSchema = z.object({
  label: z.string().min(1, "Label is required."),
  price: z.coerce.number().min(0, "Price must be positive."),
  stock: z.coerce.number().int().min(0, "Stock must be a whole number."),
});

const productSchema = z.object({
  agencyIds: z.array(z.string()).min(1, "Please select at least one agency."),
  productName: z.string().min(1, "Product name is required."),
  description: z.string().min(1, "Description is required."),
  category: z.enum(['lpg', 'accessories']),
  lowStockThreshold: z.coerce.number().int().min(0, "Threshold must be a whole number."),
  status: z.enum(['active', 'inactive']),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
});

type ProductFormValues = z.infer<typeof productSchema>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function EditProductDialog({ product, isOpen, onOpenChange, onProductUpdate }: EditProductDialogProps) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token, handleApiError } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'active',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  useEffect(() => {
    const fetchAgencies = async () => {
      if (!token || !isOpen) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/agencies/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
          setAgencies(result.data.agencies);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch active agencies.' });
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch active agencies.' });
      }
    };

    fetchAgencies();
  }, [isOpen, token, handleApiError, toast]);

  useEffect(() => {
    if (isOpen && agencies.length > 0) {
      const currentAgencyIds = product.agencies?.map(a => {
        const found = agencies.find(fa => fa.name === a.name);
        return found ? found.id : null;
      }).filter((id): id is string => id !== null) || [];

      form.reset({
        ...product,
        agencyIds: currentAgencyIds,
        status: product.status.toLowerCase() as 'active' | 'inactive',
        category: product.category || 'lpg',
      });
      setImagePreviews(product.images.map(img => img.startsWith('http') ? img : `${API_BASE_URL}${img}`));
      setImageFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [product, isOpen, form, agencies]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  
  const handleSubmit = async (values: ProductFormValues) => {
    const selectedAgencies = agencies.filter(a => values.agencyIds.includes(a.id));
    if (selectedAgencies.length === 0) {
      form.setError("agencyIds", { message: "Selected agencies not found."});
      return;
    }

    const agenciesPayload = selectedAgencies.map(agency => {
        const { id, status, createdAt, updatedAt, ...rest } = agency;
        return rest;
    });

    const { agencyIds, ...productData } = values;

    const { unit, price, stock, ...restOfProduct } = product;

    const updatedProduct: Product = {
      ...restOfProduct,
      ...productData,
      agencies: agenciesPayload,
      images: imagePreviews.filter(p => !p.startsWith('blob:')),
    };
    
    const newImagesAsBase64 = await Promise.all(imageFiles.map(file => fileToBase64(file)));
    onProductUpdate(updatedProduct, newImagesAsBase64);
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const newFiles = Array.from(files);
        const newFilePreviews = newFiles.map(file => URL.createObjectURL(file));

        setImageFiles(prevFiles => [...prevFiles, ...newFiles]);
        setImagePreviews(prevPreviews => [...prevPreviews, ...newFilePreviews]);
    }
  };

  const openImageViewer = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsViewerOpen(true);
  };
  
  const removeImage = (indexToRemove: number) => {
    const previewUrl = imagePreviews[indexToRemove];

    setImagePreviews(previews => previews.filter((_, i) => i !== indexToRemove));

    if (previewUrl.startsWith('blob:')) {
      const blobIndex = imagePreviews.filter(p => p.startsWith('blob:')).findIndex(p => p === previewUrl);
      if (blobIndex !== -1) {
        setImageFiles(files => files.filter((_, i) => i !== blobIndex));
      }
    }
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
                       <FormField
                        control={form.control}
                        name="agencyIds"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select Agencies</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between h-auto min-h-10"
                                            >
                                                <div className="flex gap-1 flex-wrap">
                                                    {field.value && field.value.length > 0 ? (
                                                        agencies
                                                            .filter(a => field.value.includes(a.id))
                                                            .map(a => <Badge key={a.id} variant="secondary">{a.name}</Badge>)
                                                    ) : (
                                                        <span className="text-muted-foreground font-normal">Select agencies...</span>
                                                    )}
                                                </div>
                                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search agencies..." />
                                            <CommandEmpty>No agency found.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandList>
                                                    {agencies.map((agency) => (
                                                        <CommandItem
                                                            key={agency.id}
                                                            onSelect={() => {
                                                                const selected = field.value.includes(agency.id);
                                                                const newValue = selected
                                                                    ? field.value.filter((id) => id !== agency.id)
                                                                    : [...field.value, agency.id];
                                                                field.onChange(newValue);
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={field.value.includes(agency.id)}
                                                                className="mr-2"
                                                            />
                                                            {agency.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                      <FormField control={form.control} name="productName" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="lpg">LPG</SelectItem><SelectItem value="accessories">Accessories</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (<FormItem><FormLabel>Low Stock Threshold</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
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
                            <>
                              <input ref={fileInputRef} id="image-upload-edit" type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*"/>
                              <div
                                className="mt-2 flex justify-center items-center flex-col w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <ImagePlus className="h-8 w-8 text-muted-foreground"/>
                                <p className="text-sm text-muted-foreground mt-2">Click or drag to add images</p>
                              </div>
                            </>
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
