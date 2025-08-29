
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
import { User } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type NewUser = Omit<User, 'id' | 'createdAt' | 'status' | 'orderHistory' | 'location' | 'address'>;

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: NewUser) => boolean;
}

const userSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }).min(1, { message: "Email is required." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type UserFormValues = z.infer<typeof userSchema>;

export function AddUserDialog({ isOpen, onOpenChange, onAddUser }: AddUserDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    }
  });

  const handleSubmit = (values: UserFormValues) => {
    if(onAddUser(values)) {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New User</DialogTitle>
          <DialogDescription>
            Enter the details below to create a new user account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
             <div className="grid gap-4 py-4 ">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Priya Sharma" {...field} />
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
                        <Input type="email" placeholder="e.g. priya@example.com" {...field} />
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
                        <Input type="tel" placeholder="e.g. 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                       <div className="relative">
                            <FormControl>
                                <Input 
                                type={showPassword ? "text" : "password"}
                                {...field}
                                />
                            </FormControl>
                            <Button 
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </Button>
                        </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
