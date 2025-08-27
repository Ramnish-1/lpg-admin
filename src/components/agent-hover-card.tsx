
"use client"

import { useEffect, useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAgentsData } from "@/lib/data";
import { Agent } from "@/lib/types";
import { Badge } from './ui/badge';

const AGENTS_STORAGE_KEY = 'gastrack-agents';

export function AgentHoverCard({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const savedAgents = window.localStorage.getItem(AGENTS_STORAGE_KEY);
        if (savedAgents) {
          const parsedAgents = JSON.parse(savedAgents).map((a: any) => ({
            ...a,
            createdAt: new Date(a.createdAt),
          }));
          setAgents(parsedAgents.filter(a => a.status === 'Online'));
        } else {
          const data = await getAgentsData();
          setAgents(data.filter(a => a.status === 'Online'));
          window.localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to load agents from localStorage", error);
        const data = await getAgentsData();
        setAgents(data.filter(a => a.status === 'Online'));
      }
    };
    fetchAgents();
  }, []);

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
                  <p className="text-sm text-muted-foreground">{agent.vehicleDetails}</p>
                </div>
                 <Badge variant={agent.status === 'Online' ? 'default' : 'outline'} className={agent.status === 'Online' ? 'bg-green-500 text-white' : ''}>
                    <span className={`inline-block w-2 h-2 mr-2 rounded-full ${agent.status === 'Online' ? 'bg-white' : 'bg-gray-400'}`}></span>
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
