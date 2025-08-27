
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Agent, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AssignAgentDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentAssigned: (orderId: string, agentId: string) => void;
  agents: Agent[];
}

export function AssignAgentDialog({ order, isOpen, onOpenChange, onAgentAssigned, agents }: AssignAgentDialogProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const handleAssign = () => {
    if (order && selectedAgentId) {
      onAgentAssigned(order.id, selectedAgentId);
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedAgentId(null);
    }
  }, [isOpen]);


  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Delivery Agent</DialogTitle>
          <DialogDescription>
            Select an available agent for order #{order.id.slice(0, 6)}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedAgentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedAgentId}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
