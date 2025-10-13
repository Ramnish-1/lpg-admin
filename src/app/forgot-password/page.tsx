
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'OTP Sent',
          description: 'An OTP has been sent to your email address.',
        });
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Send OTP',
          description: result.error || 'Could not send OTP. Please check the email and try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Could not connect to the server. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Link href="/" className="flex items-center justify-center gap-2 font-semibold mb-4 text-primary">
            <Image src="/mainIcon.png" alt="LEADWAY GAS" width={1000} height={100} />
            </Link>
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email to receive a password reset OTP.
            </p>
          </div>
          <form onSubmit={handleSendOtp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Remembered your password?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/forgot-password/1200/900"
          alt="Forgot password"
          width="1200"
          height="900"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="lock key"
        />
      </div>
    </div>
  );
}
