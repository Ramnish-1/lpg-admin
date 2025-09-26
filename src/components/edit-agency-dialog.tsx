
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
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Agency } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EditAgencyDialogProps {
  agency: Agency;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgencyUpdate: (agency: Omit<Agency, 'createdAt' | 'updatedAt' | 'status' | 'image'> & { id: string }, image?: File) => Promise<boolean>;
}

const agencySchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  phone: z.string().length(10, "Phone number must be exactly 10 digits."),
  addressTitle: z.string().min(1, "Address title is required."),
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  pincode: z.string().min(6, "Pincode must be 6 digits.").max(6, "Pincode must be 6 digits."),
  landmark: z.string().optional(),
});

type AgencyFormValues = z.infer<typeof agencySchema>;

export function EditAgencyDialog({ agency, isOpen, onOpenChange, onAgencyUpdate }: EditAgencyDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}/${imagePath}`;
  }

  const form = useForm<AgencyFormValues>({
    resolver: zodResolver(agencySchema),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(agency);
      setImagePreview(getImageUrl(agency.image));
      setImageFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [agency, isOpen, form]);

  const handleSubmit = async (values: AgencyFormValues) => {
    const success = await onAgencyUpdate({ id: agency.id, ...values }, imageFile || undefined);
    if (success) {
      onOpenChange(false);
    }
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Agency: {agency.name}</DialogTitle>
          <DialogDescription>
            Update the details for this agency.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="md:col-span-1 flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <AvatarImage src={imagePreview ?? undefined} />
                    <AvatarFallback>{form.watch('name')?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                   <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                     Change Image
                   </Button>
               </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Agency Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" {...field} maxLength={10} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="addressTitle" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Address Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="address" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="pincode" render={({ field }) => ( <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} maxLength={6} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="landmark" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Landmark</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </div>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
