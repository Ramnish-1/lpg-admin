
"use client"

import { useEffect, useState, useContext } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Agent } from "@/lib/types";
import { Badge } from './ui/badge';
import { AuthContext } from '@/context/auth-context';

export function AgentHoverCard({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/delivery-agents', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            setAgents(result.data.agents.filter((a: Agent) => a.status.toLowerCase() === 'online'));
        }
      } catch (error) {
        console.error("Failed to load agents for hover card", error);
      }
    };
    fetchAgents();
  }, [token]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
         <h4 className="font-semibold mb-2">Active Agents</h4>
        <ScrollArea className="h-48">
          <div className="space-y-4">
            {agents.map(agent => (
              <div key={agent.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.vehicleNumber}</p>
                </div>
                 <Badge variant={agent.status.toLowerCase() === 'online' ? 'default' : 'outline'} className={agent.status.toLowerCase() === 'online' ? 'bg-green-500 text-white' : ''}>
                    <span className={`inline-block w-2 h-2 mr-2 rounded-full ${agent.status.toLowerCase() === 'online' ? 'bg-white' : 'bg-gray-400'}`}></span>
                    {agent.status}
                  </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
}
