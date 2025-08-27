"use client";

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const [name, setName] = useState('Admin');
  const [email, setEmail] = useState('admin@gastrack.com');
  const [phone, setPhone] = useState('+91 99999 88888');
  const [photoUrl, setPhotoUrl] = useState('https://picsum.photos/100');
  const { toast } = useToast();

  const handleSaveChanges = () => {
    // Here you would typically call an API to save the data
    toast({
      title: 'Profile Updated',
      description: 'Your profile details have been saved successfully.',
    });
  };

  const handleChangePhoto = () => {
    // Simulate changing photo by getting a new random image
    const newPhotoId = Math.floor(Math.random() * 1000);
    setPhotoUrl(`https://picsum.photos/seed/${newPhotoId}/100`);
    toast({
      title: 'Photo Changed',
      description: 'Your profile picture has been updated.',
    });
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
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={handleChangePhoto}>Change Photo</Button>
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
