
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
import { Agent } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';


interface EditAgentDialogProps {
  agent: Agent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentUpdate: (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'joinedAt'>, agentId: string, image?: File) => Promise<boolean>;
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
  status: z.enum(['online', 'offline']),
});

type AgentFormValues = z.infer<typeof agentSchema>;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function EditAgentDialog({ agent, isOpen, onOpenChange, onAgentUpdate }: EditAgentDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
  });

  const resetForm = () => {
    form.reset({
      ...agent,
      status: agent.status.toLowerCase() as 'online' | 'offline'
    });
    setImagePreview(agent.profileImage || null);
    setImageFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [agent, isOpen]);

  const handleSubmit = async (values: AgentFormValues) => {
    const success = await onAgentUpdate(values, agent.id, imageFile || undefined);
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
       <DialogContent className="sm:max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Edit Agent Details</DialogTitle>
          <DialogDescription>
            Update the details for {agent.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="overflow-hidden flex flex-col h-full">
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-4">
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
                      <p className="text-xs text-muted-foreground text-center">Click avatar to change image</p>
                    </FormItem>
                    <FormField control={form.control} name="vehicleNumber" render={({ field }) => (<FormItem><FormLabel>Vehicle Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="online">Online</SelectItem><SelectItem value="offline">Offline</SelectItem></SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="email" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="panCardNumber" render={({ field }) => (<FormItem><FormLabel>PAN Card</FormLabel><FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} maxLength={10} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="aadharCardNumber" render={({ field }) => (<FormItem><FormLabel>Aadhar Card Number</FormLabel><FormControl><Input {...field} maxLength={12} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="drivingLicence" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Driving License</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                      <FormField control={form.control} name="bankDetails" render={({ field }) => (<FormItem className="sm:col-span-2"><FormLabel>Bank Account Details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-4 border-t bg-muted/40">
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
