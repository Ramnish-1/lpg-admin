
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
import type { Agent, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useSocketAgents } from '@/hooks/use-socket-agents';

interface AssignAgentDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentAssigned: (orderId: string, agentId: string) => void;
  initialAgents?: Agent[]; // Optional initial agents for fallback
}

export function AssignAgentDialog({ order, isOpen, onOpenChange, onAgentAssigned, initialAgents = [] }: AssignAgentDialogProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { agents, isConnected } = useSocketAgents(initialAgents);
  const { toast } = useToast();

  const handleAssign = () => {
    if (order && selectedAgentId) {
      onAgentAssigned(order.id, selectedAgentId);
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (order && order.assignedAgent) {
        // Pre-select the currently assigned agent when dialog opens for "assigned" status
        setSelectedAgentId(order.assignedAgent.id);
      } else {
        // Reset to null for new assignments (confirmed status) - this will show placeholder
        setSelectedAgentId(null);
      }
    } else {
      // Reset when dialog closes
      setSelectedAgentId(null);
    }
  }, [isOpen, order]);

  // Show connection status when dialog opens
  // useEffect(() => {
  //   if (isOpen && isConnected) {
  //     toast({
  //       title: "🔗 Real-time Connected",
  //       description: "Agent status updates are live",
  //       variant: "default",
  //     });
  //   }
  // }, [isOpen, isConnected, toast]);

  if (!order) return null;
  
  const availableAgents = agents.filter(a => a.status.toLowerCase() === 'online');
  
  // Debug logging
  console.log('🔍 AssignAgentDialog - All agents:', agents);
  console.log('🔍 AssignAgentDialog - Available agents:', availableAgents);
  console.log('🔍 AssignAgentDialog - Socket connected:', isConnected);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Delivery Agent</DialogTitle>
          <DialogDescription>
            Select an available agent for order #{order.orderNumber.slice(-8)}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Agent</label>
            <select
              value={selectedAgentId || ""}
              onChange={(e) => setSelectedAgentId(e.target.value || null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an online agent</option>
              {availableAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} {agent.Agency && `(${agent.Agency.name})`}
                </option>
              ))}
            </select>
            {availableAgents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {isConnected ? "No agents are online." : "No agents are online."}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedAgentId}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
