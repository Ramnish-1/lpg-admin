
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
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

type NewTermPayload = Omit<TermsAndCondition, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'version'>;

interface AddTermsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTermAdd: (term: NewTermPayload) => Promise<boolean>;
}

const contentSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});

const termSchema = z.object({
  title: z.string().min(1, "Main title is required."),
  content: z.array(contentSchema).min(1, "At least one content section is required."),
});

type TermFormValues = z.infer<typeof termSchema>;

export function AddTermsDialog({ isOpen, onOpenChange, onTermAdd }: AddTermsDialogProps) {
  const form = useForm<TermFormValues>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      title: '',
      content: [{ title: '', description: '' }],
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "content"
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
      <DialogContent className="sm:max-w-xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Create a New Term</DialogTitle>
          <DialogDescription>
            Enter the details below to create a new term. Add multiple sections as needed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex flex-col overflow-hidden">
             <ScrollArea className="flex-1 px-6">
              <div className="grid gap-4 py-4">
                <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Main Title</FormLabel><FormControl><Input placeholder="e.g. Company Terms and Conditions" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                
                <div className="space-y-4">
                  <FormLabel>Content Sections</FormLabel>
                   {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md relative space-y-2">
                        <FormField control={form.control} name={`content.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Section Title</FormLabel><FormControl><Input placeholder="e.g. Terms of Service" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`content.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Section Description</FormLabel><FormControl><Textarea placeholder="e.g. These are the terms of service..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>)}/>
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => remove(index)} disabled={fields.length <= 1}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  ))}
                </div>

                <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', description: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Add Section
                </Button>
                <FormMessage>{form.formState.errors.content?.root?.message}</FormMessage>

              </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-4 mt-4 border-t bg-muted/40">
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
