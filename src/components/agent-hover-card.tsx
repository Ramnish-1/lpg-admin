
"use client"

import { useEffect, useState, useContext, useMemo } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Agent } from "@/lib/types";
import { Badge } from './ui/badge';
import { AuthContext, useAuth } from '@/context/auth-context';
import { Separator } from './ui/separator';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AgentHoverCard({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { token } = useContext(AuthContext);
  const { handleApiError } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/delivery-agents`, {
            headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
            setAgents(result.data.agents);
        }
      } catch (error) {
        console.error("Failed to load agents for hover card", error);
      }
    };
    fetchAgents();
  }, [token, handleApiError]);

  const onlineAgents = useMemo(() => agents.filter(a => a.status.toLowerCase() === 'online'), [agents]);
  const offlineAgents = useMemo(() => agents.filter(a => a.status.toLowerCase() === 'offline'), [agents]);

  const AgentRow = ({ agent }: { agent: Agent }) => (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium">{agent.name}</p>
        <p className="text-sm text-muted-foreground">{agent.vehicleNumber}</p>
      </div>
      <Badge variant={agent.status.toLowerCase() === 'online' ? 'default' : 'outline'} className={agent.status.toLowerCase() === 'online' ? 'bg-green-500 text-white' : ''}>
        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${agent.status.toLowerCase() === 'online' ? 'bg-white' : 'bg-gray-400'}`}></span>
        {agent.status}
      </Badge>
    </div>
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <ScrollArea className="h-64">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Online Agents</h4>
              {onlineAgents.length > 0 ? (
                <div className="space-y-4">
                  {onlineAgents.map(agent => <AgentRow key={agent.id} agent={agent} />)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No agents are currently online.</p>
              )}
            </div>

            {offlineAgents.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-semibold mb-2 text-gray-500">Offline Agents</h4>
                   <div className="space-y-4">
                      {offlineAgents.map(agent => <AgentRow key={agent.id} agent={agent} />)}
                    </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
}
