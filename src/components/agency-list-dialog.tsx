"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Agency } from '@/lib/types';
import { Building2, MapPin } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';

interface AgencyListDialogProps {
  agencies: Agency[] | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
}

export function AgencyListDialog({ agencies, isOpen, onOpenChange, productName }: AgencyListDialogProps) {
  if (!agencies) return null;
  
  const handleAddressClick = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span>Supplying Agencies</span>
          </DialogTitle>
          <DialogDescription>
            Showing agencies for {productName || 'the selected product'}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="pr-4 -mr-6">
          {agencies.length > 0 ? (
            <div className="space-y-3">
              {agencies.map((agency) => (
                <Card key={agency.id || agency.name}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">{agency.name}</h4>
                      <a 
                          href="#" 
                          onClick={(e) => handleAddressClick(e, `${agency.address}, ${agency.city}`)} 
                          className="text-xs text-muted-foreground hover:underline flex items-start gap-1.5 mt-1"
                      >
                          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{agency.address}, {agency.city}, {agency.pincode}</span>
                      </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No agencies are assigned to this product.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
