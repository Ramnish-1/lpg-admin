
"use client";

import { useState, useRef } from 'react';
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
import { Agent } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

type NewAgentPayload = Omit<Agent, 'id' | 'joinedAt' | 'createdAt' | 'status' | 'report' | 'currentLocation' | 'updatedAt' | 'vehicleDetails' | 'panCard' | 'aadharCard' | 'drivingLicense' | 'accountDetails' | 'profileImage'>;

interface AddAgentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentAdd: (agent: NewAgentPayload, image?: File) => Promise<{success: boolean, error?: string}>;
}

const agentSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }).min(1, { message: "Email is required." }),
  phone: z.string().length(10, { message: "Phone number must be exactly 10 digits." }),
  vehicleNumber: z.string().min(1, { message: "Vehicle details are required." }),
  panCardNumber: z.string().length(10, { message: "PAN card must be 10 characters." }),
  aadharCardNumber: z.string().length(12, { message: "Aadhar card must be 12 digits." }),
  drivingLicence: z.string().min(1, { message: "Driving license is required." }),
  bankDetails: z.string().min(1, { message: "Account details are required." }),
});

type AgentFormValues = z.infer<typeof agentSchema>;

export function AddAgentDialog({ isOpen, onOpenChange, onAgentAdd }: AddAgentDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '', email: '', phone: '', vehicleNumber: '',
      panCardNumber: '', aadharCardNumber: '', drivingLicence: '', bankDetails: '',
    }
  });

  const resetForm = () => {
    form.reset();
    setImagePreview(null);
    setImageFile(null);
    setApiError(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleSubmit = async (values: AgentFormValues) => {
    setApiError(null);
    const result = await onAgentAdd(values, imageFile || undefined);
    if (result.success) {
      resetForm();
      onOpenChange(false);
    } else {
      setApiError(result.error || "An unknown error occurred.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>Fill in the details below to add a new delivery agent.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="overflow-hidden flex flex-col h-full">
             <ScrollArea className="flex-1">
                <div className="space-y-4 px-6">
                    {apiError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{apiError}</AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                      <div className="md:col-span-1 space-y-4">
                          <FormItem>
                            <FormLabel>Profile Photo</FormLabel>
                            <FormControl>
                              <>
                                <Avatar className="h-32 w-32 mx-auto cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                  <AvatarImage src={imagePreview || undefined} alt="Agent photo" />
                                  <AvatarFallback>{form.watch('name')?.charAt(0) || 'A'}</AvatarFallback>
                                </Avatar>
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                              </>
                            </FormControl>
                            <p className="text-xs text-muted-foreground text-center">Click avatar to upload image</p>
                      </FormItem>
                      <FormField control={form.control} name="vehicleNumber" render={({ field }) => (<FormItem><FormLabel>Vehicle Number</FormLabel><FormControl><Input placeholder="e.g. KA-01-AB-1234" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="e.g. 9876543210" {...field} maxLength={10} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="email" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="e.g. john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="panCardNumber" render={({ field }) => (<FormItem><FormLabel>PAN Card</FormLabel><FormControl><Input placeholder="e.g. ABCDE1234F" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} maxLength={10} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="aadharCardNumber" render={({ field }) => (<FormItem><FormLabel>Aadhar Card Number</FormLabel><FormControl><Input placeholder="e.g. 1234 5678 9012" {...field} maxLength={12} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="drivingLicence" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Driving License</FormLabel><FormControl><Input placeholder="e.g. DL1420110012345" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="bankDetails" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Bank Account Details</FormLabel><FormControl><Textarea placeholder="e.g. State Bank of India, Account: 1234567890, IFSC: SBIN0001234" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  </div>
                </div>
                </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-4 border-t bg-muted/40">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Adding...' : 'Add Agent'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
