import { useEffect, useState } from 'react';
import socketService from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';

export interface AgentStatusUpdate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  agencyId: string;
  status: 'online' | 'offline' | 'busy' | 'available';
  updatedBy: string;
  timestamp: string;
}

export const useSocketAgents = (initialAgents: any[] = []) => {
  const [agents, setAgents] = useState<any[]>(initialAgents);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const socket = socketService.getSocket();
    
    if (!socket) {
      console.warn('Socket not available');
      return;
    }

    // Connection status
    const handleConnect = () => {
      setIsConnected(true);
      console.log('🔌 Socket connected for agent updates');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('🔌 Socket disconnected for agent updates');
    };

    // Agent status update handler
    const handleAgentStatusUpdated = (data: { data: AgentStatusUpdate; type: string; timestamp: string }) => {
      const agentData = data.data;
      console.log('🎯 Agent status updated:', agentData);

      // Update agents state
      setAgents(prev => {
        const updated = prev.map(agent => 
          agent.id === agentData.id 
            ? { ...agent, status: agentData.status }
            : agent
        );
        console.log('🔄 Updated agents state:', updated);
        return updated;
      });

      // Show toast notification
      toast({
        title: "Agent Status Updated",
        description: `${agentData.name} is now ${agentData.status}`,
        variant: "default",
      });

      // Log for debugging
      console.log(`Agent ${agentData.name} (${agentData.agencyId}) status changed to: ${agentData.status}`);
    };

    // Agent created handler
    const handleAgentCreated = (data: { data: any; type: string; timestamp: string }) => {
      const agentData = data.data;
      console.log('➕ New agent created:', agentData);

      // Add new agent to state
      setAgents(prev => [agentData, ...prev]);

      toast({
        title: "New Agent Added",
        description: `${agentData.name} has been added`,
        variant: "default",
      });
    };

    // Agent updated handler
    const handleAgentUpdated = (data: { data: any; type: string; timestamp: string }) => {
      const agentData = data.data;
      console.log('🔄 Agent updated:', agentData);

      // Update agent in state
      setAgents(prev => prev.map(agent => 
        agent.id === agentData.id 
          ? { ...agent, ...agentData }
          : agent
      ));

      toast({
        title: "Agent Updated",
        description: `${agentData.name} profile has been updated`,
        variant: "default",
      });
    };

    // Setup event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('agent:status-updated', handleAgentStatusUpdated);
    socket.on('agent:created', handleAgentCreated);
    socket.on('agent:updated', handleAgentUpdated);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('agent:status-updated', handleAgentStatusUpdated);
      socket.off('agent:created', handleAgentCreated);
      socket.off('agent:updated', handleAgentUpdated);
    };
  }, [toast]);

  // Update agents list (for initial load)
  const updateAgents = (newAgents: any[]) => {
    setAgents(newAgents);
  };

  // Update initial agents when they change
  useEffect(() => {
    if (initialAgents.length > 0) {
      setAgents(initialAgents);
    }
  }, [initialAgents]);

  // Get agent by ID
  const getAgentById = (id: string) => {
    return agents.find(agent => agent.id === id);
  };

  // Get agents by status
  const getAgentsByStatus = (status: string) => {
    return agents.filter(agent => agent.status === status);
  };

  // Get agents by agency
  const getAgentsByAgency = (agencyId: string) => {
    return agents.filter(agent => agent.agencyId === agencyId);
  };

  return {
    agents,
    isConnected,
    updateAgents,
    getAgentById,
    getAgentsByStatus,
    getAgentsByAgency,
  };
};
