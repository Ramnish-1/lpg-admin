
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Mail, Loader2 } from 'lucide-react';
import type { Agent } from '@/lib/types';
import { useEffect, useState, useMemo, useContext } from 'react';
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
import { AgentReportDialog } from '@/components/agent-report-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthContext } from '@/context/auth-context';

const ITEMS_PER_PAGE = 10;

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M16.75,13.96C17,14.26 17.25,14.71 17.25,15.26C17.25,15.81 17,16.26 16.75,16.56C16.5,16.86 15.91,17.06 15.36,17.06C14.81,17.06 14.06,16.86 13.26,16.56C11.91,16.06 10.56,15.11 9.36,13.96C8.21,12.81 7.26,11.46 6.76,10.11C6.46,9.31 6.26,8.56 6.26,8C6.26,7.45 6.46,6.96 6.76,6.71C7.06,6.46 7.36,6.26 7.76,6.26C7.91,6.26 8.06,6.31 8.21,6.31C8.36,6.31 8.51,6.31 8.66,6.36C8.81,6.41 8.96,6.51 9.06,6.71C9.21,6.91 9.26,7.16 9.26,7.36C9.26,7.56 9.26,7.76 9.21,7.91C9.16,8.06 9.11,8.16 9,8.26C8.9,8.41 8.81,8.51 8.71,8.61C8.61,8.71 8.51,8.81 8.46,8.86C8.41,8.91 8.36,8.96 8.31,9.01C8.26,9.06 8.21,9.11 8.16,9.16C8.11,9.21 8.06,9.26 8.06,9.31C8.06,9.36 8.06,9.41 8.06,9.46C8.11,9.51 8.11,9.56 8.16,9.61C8.41,9.91 8.76,10.26 9.16,10.66C9.86,11.36 10.56,11.86 11.41,12.26C11.66,12.41 11.91,12.46 12.16,12.46C12.31,12.46 12.46,12.41 12.61,12.31C12.86,12.16 13.06,11.91 13.31,11.56C13.41,11.41 13.46,11.31 13.56,11.31C13.71,11.31 13.91,11.31 14.11,11.41C14.31,11.51 14.51,11.71 14.51,11.96C14.51,12.16 14.41,12.46 14.31,12.71C14.21,12.96 14.11,13.21 14,13.41C13.85,13.61 13.7,13.76 13.56,13.86C13.51,13.91 13.46,13.96 13.41,14.01C13.36,14.06 13.31,14.11 13.26,14.16C13.21,14.21 13.16,14.26 13.11,14.31C13.06,14.36 13.01,14.41 12.96,14.46C12.91,14.51 12.86,14.56 12.81,14.61C12.81,14.66 12.76,14.71 12.76,14.76C12.76,14.81 12.76,14.86 12.81,14.91C13.06,15.16 13.31,15.36 13.61,15.56C14.26,15.91 15,16.06 15.66,16.06C16.31,16.06 16.75,15.86 16.75,13.96M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22C13.66,22 15.31,21.5 16.75,20.66L18.41,22.31L19.81,20.91L18.16,19.21C19,17.76 19.5,16.16 19.5,14.5C19.5,8 16,4.5 12,4.5C10.76,4.5 9.56,4.81 8.56,5.31C7.56,5.81 6.81,6.56 6.31,7.56C5.81,8.56 5.5,9.76 5.5,11C5.5,12.25 5.81,13.45 6.31,14.45C6.81,15.45 7.56,16.21 8.56,16.71C9.56,17.21 10.76,17.5 12,17.5C13.31,17.5 14.5,17.16 15.5,16.5C16,16.16 16.25,15.71 16.25,15.26C16.25,14.81 16.11,14.46 15.86,14.16C15.61,13.86 15.26,13.66 14.91,13.66C14.61,13.66 14.36,13.76 14.11,13.96C13.86,14.16 13.71,14.36 13.61,14.56C13.26,15.11 12.66,15.5 12,15.5C11.16,15.5 10.41,15.21 9.86,14.66C9.31,14.11 9,13.36 9,12.5C9,11.66 9.31,10.91 9.86,10.36C10.41,9.81 11.16,9.5 12,9.5C12.81,9.5 13.5,9.81 14,10.36C14.5,10.91 14.75,11.61 14.75,12.36C14.75,12.56 14.7,12.76 14.66,12.96C14.96,13.16 15.26,13.26 15.56,13.26C15.91,13.26 16.21,13.16 16.46,12.96C16.71,12.71 16.75,12.41 16.75,12.11C16.75,11.36 16.46,10.71 15.86,10.11C15.26,9.5 14.5,9 13.61,8.71C14.5,7.86 15.21,7.21 15.71,6.71C15.96,6.46 16.16,6.21 16.31,5.96C17.21,6.86 17.76,8.06 17.76,9.5C17.76,10.95 17.21,12.15 16.21,13.1C15.21,14.05 13.96,14.5 12.5,14.5C12.26,14.5 12,14.5 11.76,14.45L12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22Z" />
    </svg>
  );

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token } = useContext(AuthContext);

  const fetchAgents = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
        const response = await fetch('http://localhost:5000/api/delivery-agents', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            setAgents(result.data.agents.map((a: any) => ({ ...a, joinedAt: new Date(a.joinedAt)})));
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch agents.' });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [token]);

  const totalPages = Math.ceil(agents.length / ITEMS_PER_PAGE);

  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return agents.slice(startIndex, endIndex);
  }, [agents, currentPage]);

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDeleteDialogOpen(true);
  };
  
  const handleBulkDelete = () => {
    setSelectedAgent(null);
    setIsDeleteDialogOpen(true);
  }

  const handleViewReport = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsReportDialogOpen(true);
  };

  const handleAgentUpdate = async (updatedAgent: Agent) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/delivery-agents/${updatedAgent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedAgent)
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Agent Updated', description: `${updatedAgent.name}'s details have been successfully updated.` });
        fetchAgents(); // Re-fetch agents
        setIsEditDialogOpen(false);
        setSelectedAgent(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update agent.' });
    }
  }

  const handleAgentAdd = async (newAgent: Omit<Agent, 'id' | 'createdAt' | 'status' | 'report' | 'currentLocation' | 'vehicleDetails' | 'panCard' | 'aadharCard' | 'drivingLicense' | 'accountDetails' | 'updatedAt' >): Promise<boolean> => {
     if (!token) return false;
     try {
        const payload = {
            ...newAgent,
            status: 'offline',
            joinedAt: new Date().toISOString()
        };
        const response = await fetch('http://localhost:5000/api/delivery-agents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            toast({ title: 'Agent Added', description: `${newAgent.name} has been successfully added.` });
            fetchAgents();
            return true;
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to add agent.' });
            return false;
        }
     } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add agent.' });
        return false;
     }
  }

  const confirmDelete = async () => {
    if (!token) return;
    
    const idsToDelete = selectedAgent ? [selectedAgent.id] : selectedAgentIds;
    
    try {
      const deletePromises = idsToDelete.map(id => 
        fetch(`http://localhost:5000/api/delivery-agents/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      
      const responses = await Promise.all(deletePromises);
      const successfulDeletes = responses.filter(res => res.ok).length;

      if (successfulDeletes > 0) {
        toast({
          title: 'Agent(s) Deleted',
          description: `${successfulDeletes} agent(s) have been deleted.`,
          variant: 'destructive'
        });
        fetchAgents();
        setSelectedAgentIds([]);
      } else {
         toast({ variant: 'destructive', title: 'Error', description: "Could not delete agent(s)." });
      }

    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during deletion.' });
    } finally {
        setIsDeleteDialogOpen(false);
        setSelectedAgent(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAgentIds(paginatedAgents.map(a => a.id));
    } else {
      setSelectedAgentIds([]);
    }
  };
  
  const handleSelectOne = (agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgentIds(prev => [...prev, agentId]);
    } else {
      setSelectedAgentIds(prev => prev.filter(id => id !== agentId));
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <AppShell>
      <PageHeader title="Delivery Agent Management">
        {selectedAgentIds.length > 0 ? (
          <Button size="sm" variant="destructive" className="h-8 gap-1" onClick={handleBulkDelete}>
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Delete ({selectedAgentIds.length})
            </span>
          </Button>
        ) : (
          <Button size="sm" className="h-8 gap-1" onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Agent
            </span>
          </Button>
        )}
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Agents</CardTitle>
          <CardDescription>
            Manage your delivery agents and view their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedAgentIds.length > 0 && paginatedAgents.length > 0 && selectedAgentIds.length === paginatedAgents.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="hidden sm:table-cell">Vehicle</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined On</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAgents.map((agent: Agent) => (
                <TableRow key={agent.id} data-state={selectedAgentIds.includes(agent.id) && "selected"} className="cursor-pointer">
                  <TableCell onClick={(e) => e.stopPropagation()}>
                     <Checkbox
                        checked={selectedAgentIds.includes(agent.id)}
                        onCheckedChange={(checked) => handleSelectOne(agent.id, !!checked)}
                        aria-label="Select row"
                      />
                  </TableCell>
                  <TableCell className="font-medium" onClick={() => handleViewReport(agent)} >
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <a href={`tel:${agent.phone}`} onClick={(e) => e.stopPropagation()} className="hover:underline flex items-center gap-1">
                            {agent.phone}
                        </a>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500 hover:text-green-600 -ml-2" onClick={(e) => handleWhatsAppClick(e, agent.phone)}>
                            <WhatsAppIcon className="h-4 w-4" />
                        </Button>
                    </div>
                     <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5"/>
                        <a href={`mailto:${agent.email}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                            {agent.email}
                        </a>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => handleViewReport(agent)} className="hidden sm:table-cell">{agent.vehicleNumber}</TableCell>
                  <TableCell onClick={() => handleViewReport(agent)} className="hidden md:table-cell">
                    <Badge variant={agent.status.toLowerCase() === 'online' ? 'default' : 'outline'} className={agent.status.toLowerCase() === 'online' ? 'bg-green-500 text-white' : ''}>
                      <span className={`inline-block w-2 h-2 mr-2 rounded-full ${agent.status.toLowerCase() === 'online' ? 'bg-white' : 'bg-gray-400'}`}></span>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => handleViewReport(agent)} className="hidden lg:table-cell">{new Date(agent.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(agent)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewReport(agent)}>View Report</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(agent)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedAgents.length} of {agents.length} agents.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
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
              This action cannot be undone. This will permanently delete the agent(s)
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {selectedAgent && (
        <AgentReportDialog
          agent={selectedAgent}
          isOpen={isReportDialogOpen}
          onOpenChange={setIsReportDialogOpen}
        />
      )}
    </AppShell>
  );
}
