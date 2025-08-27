
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Order } from '@/lib/types';

interface ReturnOrderDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

const returnReasons = [
  "Gas leak reported",
  "Damaged cylinder",
  "Wrong product delivered",
  "Customer changed mind",
  "Other",
];

export function ReturnOrderDialog({ order, isOpen, onOpenChange, onConfirm }: ReturnOrderDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selectedReason) {
      setError("Please select a reason for the return.");
      return;
    }
    if (selectedReason === 'Other' && !otherReason.trim()) {
       setError("Please specify the reason in the text box.");
       return;
    }
    
    const finalReason = selectedReason === 'Other' ? otherReason : selectedReason;
    onConfirm(finalReason);
    resetState();
  };

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
    if (value !== 'Other') {
        setOtherReason('');
    }
    setError(null);
  };
  
  const resetState = () => {
    setSelectedReason('');
    setOtherReason('');
    setError(null);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  }

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Order #{order.id.slice(0,6)}</DialogTitle>
          <DialogDescription>
            Please select a reason for this return. This will update the order status.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <RadioGroup value={selectedReason} onValueChange={handleReasonChange}>
                {returnReasons.map(reason => (
                    <div key={reason} className="flex items-center space-x-2">
                        <RadioGroupItem value={reason} id={`return-${reason}`} />
                        <Label htmlFor={`return-${reason}`}>{reason}</Label>
                    </div>
                ))}
            </RadioGroup>
            {selectedReason === 'Other' && (
                 <Textarea 
                    placeholder="Please specify the reason for the return..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="mt-2"
                />
            )}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Back</Button>
          </DialogClose>
          <Button onClick={handleConfirm} variant="destructive">Confirm Return</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
