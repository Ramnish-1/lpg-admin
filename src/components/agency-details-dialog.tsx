
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Agency } from '@/lib/types';
import { Mail, Phone, MapPin, Calendar, Building2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

interface AgencyDetailsDialogProps {
  agency: Agency | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgencyDetailsDialog({ agency, isOpen, onOpenChange }: AgencyDetailsDialogProps) {
  if (!agency) return null;
  
  const fullAddress = `${agency.address}, ${agency.landmark ? agency.landmark + ', ' : ''}${agency.city}, ${agency.pincode}`;

  const handleAddressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-full">
                <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
                <DialogTitle className="text-2xl">{agency.name}</DialogTitle>
                <DialogDescription>
                    Agency since {new Date(agency.createdAt).toLocaleDateString()}
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Separator />
        <div className="space-y-4 pt-2">
            <h3 className="text-sm font-medium text-muted-foreground">Contact & Location</h3>
            <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a href={`mailto:${agency.email}`} className="text-sm hover:underline">{agency.email}</a>
            </div>
             <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href={`tel:${agency.phone}`} className="text-sm hover:underline">{agency.phone}</a>
            </div>
            <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                    <p className="font-medium">{agency.addressTitle}</p>
                    <a 
                      href="#" 
                      onClick={handleAddressClick} 
                      className="text-muted-foreground hover:underline"
                    >
                      {fullAddress}
                    </a>
                </div>
            </div>
            <Separator />
             <h3 className="text-sm font-medium text-muted-foreground">Account Details</h3>
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium mr-2">Status:</span>
                <Badge className={cn('capitalize', {
                    'bg-green-100 text-green-800': agency.status === 'active',
                    'bg-red-100 text-red-800': agency.status === 'inactive'
                })}>
                    {agency.status}
                </Badge>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
