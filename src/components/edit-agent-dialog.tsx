
"use client";

import { useState, useEffect } from 'react';
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

interface EditAgentDialogProps {
  agent: Agent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentUpdate: (agent: Agent) => void;
}

export function EditAgentDialog({ agent, isOpen, onOpenChange, onAgentUpdate }: EditAgentDialogProps) {
  const [name, setName] = useState(agent.name);
  const [phone, setPhone] = useState(agent.phone);
  const [email, setEmail] = useState(agent.email);
  const [vehicle, setVehicle] = useState(agent.vehicleDetails);
  const [pan, setPan] = useState(agent.panCard);
  const [aadhar, setAadhar] = useState(agent.aadharCard);
  const [account, setAccount] = useState(agent.accountDetails);
  const { toast } = useToast();


  useEffect(() => {
    if (isOpen) {
      setName(agent.name);
      setPhone(agent.phone);
      setEmail(agent.email);
      setVehicle(agent.vehicleDetails);
      setPan(agent.panCard);
      setAadhar(agent.aadharCard);
      setAccount(agent.accountDetails);
    }
  }, [agent, isOpen]);

  const handleSubmit = () => {
    if (!name || !phone || !email || !vehicle || !pan || !aadhar || !account) {
       toast({
        title: 'Missing Fields',
        description: 'Please fill out all the required fields.',
        variant: 'destructive',
      });
      return;
    }
    const updatedAgent = {
      ...agent,
      name,
      phone,
      email,
      vehicleDetails: vehicle,
      panCard: pan,
      aadharCard: aadhar,
      accountDetails: account,
    };
    onAgentUpdate(updatedAgent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Agent Details</DialogTitle>
          <DialogDescription>
            Update the details for the delivery agent.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="name-edit">Name</Label>
              <Input id="name-edit" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email-edit">Email</Label>
              <Input id="email-edit" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone-edit">Phone</Label>
              <Input id="phone-edit" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle-edit">Vehicle</Label>
              <Input id="vehicle-edit" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan-edit">PAN Card</Label>
              <Input id="pan-edit" value={pan} onChange={(e) => setPan(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhar-edit">Aadhar Card</Label>
              <Input id="aadhar-edit" value={aadhar} onChange={(e) => setAadhar(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-edit">Bank Account Details</Label>
              <Input id="account-edit" value={account} onChange={(e) => setAccount(e.target.value)} />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
