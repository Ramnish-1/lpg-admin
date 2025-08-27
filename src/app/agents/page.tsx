"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { getAgentsData } from '@/lib/data';
import type { Agent } from '@/lib/types';
import { useEffect, useState } from 'react';
import { EditAgentDialog } from '@/components/edit-agent-dialog';
import { AddAgentDialog } from '@/components/add-agent-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    getAgentsData().then(setAgents);
  }, []);

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDeleteDialogOpen(true);
  };
  
  const handleAgentUpdate = (updatedAgent: Agent) => {
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    toast({
      title: 'Agent Updated',
      description: `${updatedAgent.name}'s details have been successfully updated.`,
    });
    setIsEditDialogOpen(false);
    setSelectedAgent(null);
  }

  const handleAgentAdd = (newAgent: Omit<Agent, 'id' | 'createdAt' | 'status'>) => {
    const agentToAdd: Agent = {
      ...newAgent,
      id: `agt_${Date.now()}`,
      createdAt: new Date(),
      status: 'Offline',
    }
    setAgents(prev => [...prev, agentToAdd]);
     toast({
      title: 'Agent Added',
      description: `${agentToAdd.name} has been successfully added.`,
    });
    setIsAddDialogOpen(false);
  }

  const confirmDelete = () => {
    if (selectedAgent) {
      setAgents(agents.filter(a => a.id !== selectedAgent.id));
      toast({
        title: 'Agent Deleted',
        description: `${selectedAgent.name} has been deleted.`,
        variant: 'destructive'
      });
      setIsDeleteDialogOpen(false);
      setSelectedAgent(null);
    }
  };


  return (
    <AppShell>
      <PageHeader title="Delivery Agent Management">
        <Button size="sm" className="h-8 gap-1" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Agent
          </span>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Agents</CardTitle>
          <CardDescription>
            Manage your delivery agents and view their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined On</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent: Agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.phone}</div>
                  </TableCell>
                  <TableCell>{agent.vehicleDetails}</TableCell>
                  <TableCell>
                    <Badge variant={agent.status === 'Online' ? 'default' : 'outline'} className={agent.status === 'Online' ? 'bg-green-500 text-white' : ''}>
                      <span className={`inline-block w-2 h-2 mr-2 rounded-full ${agent.status === 'Online' ? 'bg-white' : 'bg-gray-400'}`}></span>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(agent.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(agent)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Report</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(agent)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddAgentDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAgentAdd={handleAgentAdd}
      />

      {selectedAgent && (
        <EditAgentDialog 
          agent={selectedAgent} 
          isOpen={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          onAgentUpdate={handleAgentUpdate}
        />
      )}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the agent
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
