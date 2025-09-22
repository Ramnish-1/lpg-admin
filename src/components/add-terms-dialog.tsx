
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
import { TermsAndCondition } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';

type NewTermPayload = Omit<TermsAndCondition, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'version'>;

interface AddTermsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTermAdd: (term: NewTermPayload) => Promise<boolean>;
}

const termSchema = z.object({
  title: z.string().min(1, "Main title is required."),
  description: z.string().min(1, "Main description is required."),
});

type TermFormValues = z.infer<typeof termSchema>;

export function AddTermsDialog({ isOpen, onOpenChange, onTermAdd }: AddTermsDialogProps) {
  const form = useForm<TermFormValues>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      title: '',
      description: '',
    }
  });

  const handleSubmit = async (values: TermFormValues) => {
    const success = await onTermAdd(values);
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
          <DialogTitle>Create a New Term</DialogTitle>
          <DialogDescription>
            Enter the details below to create a new term.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <div className="grid gap-4 py-4">
               <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g. Company Terms and Conditions" {...field} /></FormControl><FormMessage /></FormItem>)}/>
               <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g. General terms for using our service..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>)}/>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Term'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
