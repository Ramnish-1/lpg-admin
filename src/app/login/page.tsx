
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

const GasPump = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M14 11h2v8h-2v-3.5a1.5 1.5 0 0 0-3 0V19H9v-8h2v1.5c.5-.83 1.5-1.5 2.5-1.5zM4 3h15v2H4z" />
    <path d="M18.5 6H10a1 1 0 0 0-1 1v12h10V7a1 1 0 0 0-1-1h-.5zM12 9h6v2h-6V9z" />
    <path d="M8 7H5v12h3V7zm-2 2h1v2H6V9z" />
  </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = () => {
    if (login(email, password)) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
       <div className="flex flex-col items-center mb-8">
         <Link href="/" className="flex items-center gap-2 font-semibold mb-4 text-primary">
            <GasPump className="h-8 w-8" />
            <span className="text-2xl">GasTrack Admin</span>
          </Link>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
          <div className="mt-4 text-center text-sm p-6 pt-0">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
