
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
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const contentSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  content: z.string().min(1, "Content is required."),
});

const termSchema = z.object({
  title: z.string().min(1, "Main title is required."),
  description: z.string().min(1, "Main description is required."),
  content: z.array(contentSchema).min(1, "At least one content section is required."),
});

type TermFormValues = z.infer<typeof termSchema>;

interface EditTermsDialogProps {
  term: TermsAndCondition;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTermUpdate: (term: Omit<TermsAndCondition, 'createdAt' | 'updatedAt' | 'status' | 'version'>) => Promise<boolean>;
}

export function EditTermsDialog({ term, isOpen, onOpenChange, onTermUpdate }: EditTermsDialogProps) {
  const form = useForm<TermFormValues>({
    resolver: zodResolver(termSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "content"
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: term.title,
        description: term.description,
        content: term.content && term.content.length > 0 ? term.content : [{ title: '', description: '', content: '' }],
      });
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
      <DialogContent className="sm:max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Edit Term: {term.title}</DialogTitle>
          <DialogDescription>
            Update the details for this term. You can add or remove content sections.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-2">
                    <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Main Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Main Description</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)}/>

                    <div>
                        <FormLabel>Content Sections</FormLabel>
                        <div className="space-y-4 mt-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="space-y-3 p-4 border rounded-md relative">
                                    <FormField control={form.control} name={`content.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Section Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name={`content.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Section Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name={`content.${index}.content`} render={({ field }) => ( <FormItem><FormLabel>Section Content</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)}/>
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 shrink-0" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ title: '', description: '', content: '' })}><PlusCircle className="mr-2 h-4 w-4"/>Add Section</Button>
                        <FormMessage>{form.formState.errors.content?.message || form.formState.errors.content?.root?.message}</FormMessage>
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-4 mt-4 border-t bg-muted/40">
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
