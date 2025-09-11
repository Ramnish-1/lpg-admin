
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
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Agency } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditAgencyDialogProps {
  agency: Agency;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgencyUpdate: (agency: Omit<Agency, 'createdAt' | 'updatedAt'>) => Promise<boolean>;
}

const agencySchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  addressTitle: z.string().min(1, "Address title is required."),
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  pincode: z.string().min(6, "Pincode must be 6 digits.").max(6, "Pincode must be 6 digits."),
  landmark: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type AgencyFormValues = z.infer<typeof agencySchema>;

export function EditAgencyDialog({ agency, isOpen, onOpenChange, onAgencyUpdate }: EditAgencyDialogProps) {
  const form = useForm<AgencyFormValues>({
    resolver: zodResolver(agencySchema),
  });
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        ...agency,
        status: agency.status.toLowerCase() as 'active' | 'inactive'
      });
    }
  }, [agency, isOpen, form]);

  const handleSubmit = async (values: AgencyFormValues) => {
    const success = await onAgencyUpdate({ id: agency.id, ...values });
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Agency: {agency.name}</DialogTitle>
          <DialogDescription>
            Update the details for this agency.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
             <div className="grid grid-cols-2 gap-4 py-4">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Agency Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="addressTitle" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Address Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="pincode" render={({ field }) => ( <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="landmark" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Landmark</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem className="col-span-2"><FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
                <FormMessage /></FormItem>)}/>
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

    
