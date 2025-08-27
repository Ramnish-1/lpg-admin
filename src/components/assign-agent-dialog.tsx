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
import { getAgentsData } from '@/lib/data';
import type { Agent, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AssignAgentDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentAssigned: (orderId: string, agentId: string, agentName: string) => void;
}

export function AssignAgentDialog({ order, isOpen, onOpenChange, onAgentAssigned }: AssignAgentDialogProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      getAgentsData().then(data => {
        const onlineAgents = data.filter(a => a.status === 'Online');
        setAgents(onlineAgents);
      });
    }
  }, [isOpen]);

  const handleAssign = () => {
    if (order && selectedAgentId) {
      const agent = agents.find(a => a.id === selectedAgentId);
      if (agent) {
        onAgentAssigned(order.id, agent.id, agent.name);
        toast({
          title: "Agent Assigned",
          description: `${agent.name} has been assigned to order #${order.id.slice(0, 6)}.`,
        });
        onOpenChange(false);
      }
    }
  };

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
              <SelectValue placeholder="Select an online agent" />
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
