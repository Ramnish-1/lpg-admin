
"use client";

import { useState, useContext, useEffect, useRef } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ProfileContext } from '@/context/profile-context';

export default function ProfilePage() {
  const { profile, setProfile } = useContext(ProfileContext);
  
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setName(profile.name);
    setPhotoUrl(profile.photoUrl);
    setEmail(profile.email);
    setPhone(profile.phone);
  }, [profile]);

  const handleSaveChanges = () => {
    setProfile({ name, email, phone, photoUrl });
    toast({
      title: 'Profile Updated',
      description: 'Your profile details have been saved successfully.',
    });
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotoUrl = reader.result as string;
        setPhotoUrl(newPhotoUrl);
        setProfile({ photoUrl: newPhotoUrl });
        toast({
          title: 'Photo Changed',
          description: 'Your profile picture has been updated.',
        });
      };
      reader.readAsDataURL(file);
    }
  };


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
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoUrl} alt="@admin" data-ai-hint="manager portrait"/>
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
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
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue="Administrator" disabled />
            </div>
          </div>
           <div className="flex justify-end">
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
