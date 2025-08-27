
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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { PaymentMethod } from '@/lib/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Trash2 } from 'lucide-react';

interface EditPaymentMethodDialogProps {
  method: PaymentMethod;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMethodUpdate: (method: PaymentMethod) => void;
}

const paymentMethodSchema = z.object({
  name: z.string().min(1, "Method name is required."),
  description: z.string().min(1, "Description is required."),
  config: z.array(z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required"),
  })),
});

type MethodFormValues = z.infer<typeof paymentMethodSchema>;

export function EditPaymentMethodDialog({ method, isOpen, onOpenChange, onMethodUpdate }: EditPaymentMethodDialogProps) {
  const form = useForm<MethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
        name: method.name,
        description: method.description,
        config: Object.entries(method.config).map(([key, value]) => ({ key, value })),
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "config"
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: method.name,
        description: method.description,
        config: Object.entries(method.config).map(([key, value]) => ({ key, value: String(value) })),
      });
    }
  }, [method, isOpen, form]);

  const handleSubmit = (values: MethodFormValues) => {
    const configObject = values.config.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {} as Record<string, any>);

    const updatedMethod = {
      ...method,
      name: values.name,
      description: values.description,
      config: configObject,
    };
    onMethodUpdate(updatedMethod);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit: {method.name}</DialogTitle>
          <DialogDescription>
            Update the details for this payment method.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <div className="grid gap-4 py-4">
               <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Method Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                    <FormLabel>Configuration</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-center">
                            <FormField
                                control={form.control}
                                name={`config.${index}.key`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl><Input placeholder="Key" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`config.${index}.value`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl><Input placeholder="Value" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                    </div>
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => append({ key: "", value: "" })}
                        >
                        Add Configuration
                    </Button>
                </div>

            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
