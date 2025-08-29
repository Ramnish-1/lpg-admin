
"use client";

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

type NewAgentPayload = Omit<Agent, 'id' | 'joinedAt' | 'createdAt' | 'status' | 'report' | 'currentLocation' | 'updatedAt' | 'vehicleDetails' | 'panCard' | 'aadharCard' | 'drivingLicense' | 'accountDetails'>;


interface AddAgentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentAdd: (agent: NewAgentPayload) => Promise<boolean>;
}

const agentSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }).min(1, { message: "Email is required." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  vehicleNumber: z.string().min(1, { message: "Vehicle details are required." }),
  panCardNumber: z.string().length(10, { message: "PAN card must be 10 characters." }),
  aadharCardNumber: z.string().min(1, { message: "Aadhar card is required." }),
  drivingLicence: z.string().min(1, { message: "Driving license is required." }),
  bankDetails: z.string().min(1, { message: "Account details are required." }),
});

type AgentFormValues = z.infer<typeof agentSchema>;

export function AddAgentDialog({ isOpen, onOpenChange, onAgentAdd }: AddAgentDialogProps) {
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      vehicleNumber: '',
      panCardNumber: '',
      aadharCardNumber: '',
      drivingLicence: '',
      bankDetails: '',
    }
  });

  const handleSubmit = async (values: AgentFormValues) => {
    const success = await onAgentAdd(values);
    if (success) {
      form.reset();
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add New Agent</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="overflow-hidden flex flex-col h-full">
             <ScrollArea className="flex-1 px-6">
              <div className="grid gap-4 py-4 ">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="e.g. john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. KA-01-AB-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="panCardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Card</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. ABCDE1234F" 
                          {...field}
                          onChange={(e) => {
                            const upperValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                            field.onChange(upperValue);
                          }}
                          maxLength={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aadharCardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhar Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1234 5678 9012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="drivingLicence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driving License</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. DL1420110012345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Details</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. State Bank of India&#10;Account: 1234567890&#10;IFSC: SBIN0001234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
