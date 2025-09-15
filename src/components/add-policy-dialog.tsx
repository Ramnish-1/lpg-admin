
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
import { PrivacyPolicy } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';

type NewPolicyPayload = Omit<PrivacyPolicy, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'version'>;

interface AddPolicyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPolicyAdd: (policy: NewPolicyPayload) => Promise<boolean>;
}

const policySchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});

type PolicyFormValues = z.infer<typeof policySchema>;

export function AddPolicyDialog({ isOpen, onOpenChange, onPolicyAdd }: AddPolicyDialogProps) {
  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      title: '',
      description: '',
    }
  });

  const handleSubmit = async (values: PolicyFormValues) => {
    const success = await onPolicyAdd(values);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New Policy</DialogTitle>
          <DialogDescription>
            Enter the details below to create a new privacy policy.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
             <div className="grid gap-4 py-4">
                <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g. Privacy Policy - Data Collection" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Enter the full description of the policy..." {...field} rows={6} /></FormControl><FormMessage /></FormItem>)}/>
              </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Policy'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
