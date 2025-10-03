'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSocket } from '@/context/socket-context';
import { useToast } from '@/hooks/use-toast';
import socketService, { SocketEventData, AgencyEventData, AgentEventData } from '@/lib/socket';

interface AgencySocketHook {
  agencies: AgencyEventData[];
  agents: AgentEventData[];
  addAgency: (agency: AgencyEventData) => void;
  updateAgency: (agencyId: string, updates: Partial<AgencyEventData>) => void;
  removeAgency: (agencyId: string) => void;
  addAgent: (agent: AgentEventData) => void;
  updateAgent: (agentId: string, updates: Partial<AgentEventData>) => void;
  removeAgent: (agentId: string) => void;
  clearAgencies: () => void;
  clearAgents: () => void;
}

export const useSocketAgencies = (): AgencySocketHook => {
  const { isConnected } = useSocket();
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<AgencyEventData[]>([]);
  const [agents, setAgents] = useState<AgentEventData[]>([]);

  const addAgency = useCallback((agency: AgencyEventData) => {
    setAgencies(prev => {
      const exists = prev.find(a => a.id === agency.id);
      if (exists) {
        return prev.map(a => a.id === agency.id ? { ...a, ...agency } : a);
      }
      return [agency, ...prev];
    });
  }, []);

  const updateAgency = useCallback((agencyId: string, updates: Partial<AgencyEventData>) => {
    setAgencies(prev => prev.map(agency => 
      agency.id === agencyId ? { ...agency, ...updates } : agency
    ));
  }, []);

  const removeAgency = useCallback((agencyId: string) => {
    setAgencies(prev => prev.filter(agency => agency.id !== agencyId));
  }, []);

  const addAgent = useCallback((agent: AgentEventData) => {
    setAgents(prev => {
      const exists = prev.find(a => a.id === agent.id);
      if (exists) {
        return prev.map(a => a.id === agent.id ? { ...a, ...agent } : a);
      }
      return [agent, ...prev];
    });
  }, []);

  const updateAgent = useCallback((agentId: string, updates: Partial<AgentEventData>) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));
  }, []);

  const removeAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId));
  }, []);

  const clearAgencies = useCallback(() => {
    setAgencies([]);
  }, []);

  const clearAgents = useCallback(() => {
    setAgents([]);
  }, []);

  // Agency Created Handler
  const handleAgencyCreated = useCallback((data: SocketEventData) => {
    const agency = data.data as AgencyEventData;
    console.log('🏢 New Agency Created:', agency);
    
    addAgency(agency);
    
    toast({
      title: "New Agency Created",
      description: `Agency "${agency.name}" has been created`,
      variant: "default",
    });
  }, [addAgency, toast]);

  // Agency Updated Handler
  const handleAgencyUpdated = useCallback((data: SocketEventData) => {
    const agency = data.data as AgencyEventData;
    console.log('📝 Agency Updated:', agency);
    
    updateAgency(agency.id, agency);
    
    let description = `Agency "${agency.name}" has been updated`;
    let variant: "default" | "destructive" = "default";
    
    if (agency.statusChanged) {
      description = `Agency "${agency.name}" status changed to ${agency.status}`;
      variant = agency.status === 'inactive' ? 'destructive' : 'default';
    }
    
    toast({
      title: "Agency Updated",
      description,
      variant,
    });
  }, [updateAgency, toast]);

  // Agent Created Handler
  const handleAgentCreated = useCallback((data: SocketEventData) => {
    const agent = data.data as AgentEventData;
    console.log('👤 New Agent Created:', agent);
    
    addAgent(agent);
    
    toast({
      title: "New Agent Created",
      description: `Agent "${agent.name}" has been created`,
      variant: "default",
    });
  }, [addAgent, toast]);

  // Agent Updated Handler
  const handleAgentUpdated = useCallback((data: SocketEventData) => {
    const agent = data.data as AgentEventData;
    console.log('📝 Agent Updated:', agent);
    
    updateAgent(agent.id, agent);
    
    toast({
      title: "Agent Updated",
      description: `Agent "${agent.name}" has been updated`,
      variant: "default",
    });
  }, [updateAgent, toast]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to agency events
    socketService.onAgencyCreated(handleAgencyCreated);
    socketService.onAgencyUpdated(handleAgencyUpdated);
    
    // Subscribe to agent events
    socketService.onAgentCreated(handleAgentCreated);
    socketService.onAgentUpdated(handleAgentUpdated);

    // Cleanup on unmount
    return () => {
      socketService.offAgencyCreated(handleAgencyCreated);
      socketService.offAgencyUpdated(handleAgencyUpdated);
      socketService.offAgentCreated(handleAgentCreated);
      socketService.offAgentUpdated(handleAgentUpdated);
    };
  }, [isConnected, handleAgencyCreated, handleAgencyUpdated, handleAgentCreated, handleAgentUpdated]);

  return {
    agencies,
    agents,
    addAgency,
    updateAgency,
    removeAgency,
    addAgent,
    updateAgent,
    removeAgent,
    clearAgencies,
    clearAgents,
  };
};
