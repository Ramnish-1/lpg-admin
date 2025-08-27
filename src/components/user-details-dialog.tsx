
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/types';
import { Mail, Phone, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';

interface UserDetailsDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, isOpen, onOpenChange }: UserDetailsDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={`https://picsum.photos/seed/${user.id}/100`} alt={user.name} data-ai-hint="person portrait" />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <DialogTitle className="text-2xl">{user.name}</DialogTitle>
                <DialogDescription>
                    Customer since {new Date(user.createdAt).toLocaleDateString()}
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Separator />
        <div className="space-y-4 pt-2">
            <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
            <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
            </div>
             <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{user.phone}</span>
            </div>
            <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <span className="text-sm">{user.address}</span>
            </div>
            <Separator />
             <h3 className="text-sm font-medium text-muted-foreground">Account Details</h3>
            <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                 <span className="text-sm font-medium mr-2">Status:</span>
                <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
            </div>
             <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Registered on: {new Date(user.createdAt).toLocaleString()}</span>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
