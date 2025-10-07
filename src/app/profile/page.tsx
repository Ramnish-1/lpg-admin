
"use client";

import { useState, useContext, useEffect, useRef } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ProfileContext } from '@/context/profile-context';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProfilePage() {
  const { profile, setProfile, isFetchingProfile } = useContext(ProfileContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isFetchingProfile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone);
      setPhotoUrl(profile.photoUrl || '');
    }
  }, [profile, isFetchingProfile]);

  const handleSaveChanges = async () => {
    // basic validation for required fields
    const phoneDigitsOnly = phone.replace(/\D/g, '');
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Name is required' });
      return;
    }
    if (phoneDigitsOnly.length !== 10) {
      toast({ variant: 'destructive', title: 'Phone must be 10 digits' });
      return;
    }
    setIsSaving(true);
    const success = await setProfile({ name, email, phone: phoneDigitsOnly, role: profile.role, photoFile: photoFile || undefined });
    if (success) {
        toast({
            title: 'Profile Updated',
            description: 'Your profile details have been saved successfully.',
        });
        setPhotoFile(null); // Clear the file after successful upload
    } else {
         toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not save your profile. Please try again.',
        });
    }
    setIsSaving(false);
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const newPhotoUrl = URL.createObjectURL(file);
      setPhotoUrl(newPhotoUrl);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const displayPhotoUrl = photoUrl.startsWith('https://') || photoUrl.startsWith('blob:')
    ? photoUrl
    : photoUrl ? `${API_BASE_URL}/${photoUrl}` : '';

  if (isFetchingProfile) {
    return (
        <AppShell>
            <PageHeader title="My Profile" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-10 w-28" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-16" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        </AppShell>
    )
  }


  return (
    <AppShell>
      <PageHeader title="My Profile" />
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={displayPhotoUrl} alt="@admin" data-ai-hint="manager portrait"/>
                <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {displayPhotoUrl && (
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={handleRemovePhoto}
                  className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/10 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button variant="outline" onClick={handleChangePhotoClick}>Change Photo</Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              className="hidden" 
              accept="image/*"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} disabled={isSaving}/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={profile.role} disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveChanges} disabled={isSaving || !name.trim() || phone.replace(/\D/g, '').length !== 10}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
