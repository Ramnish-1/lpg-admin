
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Agent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface AddAgentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentAdd: (agent: Omit<Agent, 'id' | 'createdAt' | 'status' | 'report' | 'currentLocation'>) => void;
}

export function AddAgentDialog({ isOpen, onOpenChange, onAgentAdd }: AddAgentDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [pan, setPan] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [account, setAccount] = useState('');
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setVehicle('');
    setPan('');
    setAadhar('');
    setAccount('');
  }

  const handleSubmit = () => {
    if (!name || !phone || !email || !vehicle || !pan || !aadhar || !account) {
       toast({
        title: 'Missing Fields',
        description: 'Please fill out all the required fields.',
        variant: 'destructive',
      });
      return;
    }
    onAgentAdd({
      name,
      phone,
      email,
      vehicleDetails: vehicle,
      panCard: pan,
      aadharCard: aadhar,
      accountDetails: account,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Enter the details for the new delivery agent. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. john.doe@example.com"/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Input id="vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="e.g. KA-01-AB-1234"/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="pan">PAN Card</Label>
              <Input id="pan" value={pan} onChange={(e) => setPan(e.target.value)} placeholder="e.g. ABCDE1234F"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhar">Aadhar Card</Label>
              <Input id="aadhar" value={aadhar} onChange={(e) => setAadhar(e.target.value)} placeholder="e.g. 1234 5678 9012"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Bank Account Details</Label>
              <Input id="account" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="e.g. SBI - 1234567890"/>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
