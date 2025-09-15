
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
import { TermsAndCondition } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';

interface EditTermsDialogProps {
  term: TermsAndCondition;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTermUpdate: (term: Omit<TermsAndCondition, 'createdAt' | 'updatedAt' | 'status'>) => Promise<boolean>;
}

const termSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  version: z.string().min(1, "Version is required."),
});

type TermFormValues = z.infer<typeof termSchema>;

export function EditTermsDialog({ term, isOpen, onOpenChange, onTermUpdate }: EditTermsDialogProps) {
  const form = useForm<TermFormValues>({
    resolver: zodResolver(termSchema),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(term);
    }
  }, [term, isOpen, form]);

  const handleSubmit = async (values: TermFormValues) => {
    const success = await onTermUpdate({ id: term.id, ...values });
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Term: {term.title}</DialogTitle>
          <DialogDescription>
            Update the details for this term.
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
