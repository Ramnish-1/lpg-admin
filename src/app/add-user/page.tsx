
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Eye, EyeOff } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function AddUserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      toast({
        variant: 'destructive',
        title: 'User Creation Failed',
        description: 'Please fill in all fields.',
      });
      return;
    }
    
    if (signup(name, email, password, phone)) {
      toast({
        title: 'User Created Successfully',
        description: `${name} can now log in.`,
      });
      // Clear form
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      // Optional: redirect to customers page
      router.push('/customers');
    } else {
       toast({
        variant: 'destructive',
        title: 'User Creation Failed',
        description: 'An account with this email already exists.',
      });
    }
  };

  return (
    <AppShell>
        <PageHeader title="Add a New User" />
        <Card>
            <CardHeader>
                <CardTitle>Create User Account</CardTitle>
                <CardDescription>Enter the details below to create a new user account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddUser} className="grid gap-6 max-w-lg">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input 
                            id="name" 
                            placeholder="e.g. Priya Sharma" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="priya@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                            id="phone" 
                            type="tel"
                            placeholder="9876543210" 
                            required 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"}
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
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
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Create User</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </AppShell>
  );
}
