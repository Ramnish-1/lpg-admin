
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
import { PrivacyPolicy } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';

interface EditPolicyDialogProps {
  policy: PrivacyPolicy;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPolicyUpdate: (policy: Omit<PrivacyPolicy, 'createdAt' | 'updatedAt' | 'status'>) => Promise<boolean>;
}

const policySchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  version: z.string().min(1, "Version is required."),
});

type PolicyFormValues = z.infer<typeof policySchema>;

export function EditPolicyDialog({ policy, isOpen, onOpenChange, onPolicyUpdate }: EditPolicyDialogProps) {
  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(policy);
    }
  }, [policy, isOpen, form]);

  const handleSubmit = async (values: PolicyFormValues) => {
    const success = await onPolicyUpdate({ id: policy.id, ...values });
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Policy: {policy.title}</DialogTitle>
          <DialogDescription>
            Update the details for this privacy policy.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <div className="grid gap-4 py-4">
               <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
               <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={6} /></FormControl><FormMessage /></FormItem>)}/>
               <FormField control={form.control} name="version" render={({ field }) => ( <FormItem><FormLabel>Version</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
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
