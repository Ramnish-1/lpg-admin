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

interface EditAgentDialogProps {
  agent: Agent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAgentDialog({ agent, isOpen, onOpenChange }: EditAgentDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(agent.name);
  const [phone, setPhone] = useState(agent.phone);
  const [vehicle, setVehicle] = useState(agent.vehicleDetails);

  const handleSubmit = () => {
    console.log('Updating agent:', { ...agent, name, phone, vehicleDetails: vehicle });
    toast({
      title: 'Agent Updated',
      description: `${name}'s details have been successfully updated.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Agent Details</DialogTitle>
          <DialogDescription>
            Update the details for the delivery agent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicle" className="text-right">
              Vehicle
            </Label>
            <Input id="vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
