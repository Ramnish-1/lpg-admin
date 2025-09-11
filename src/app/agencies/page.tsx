
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import type { Agency } from '@/lib/types';
import { useEffect, useState, useMemo, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext, useAuth } from '@/context/auth-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AddAgencyDialog } from '@/components/add-agency-dialog';
import { EditAgencyDialog } from '@/components/edit-agency-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAgencies = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        setAgencies(result.data.agencies.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt)})));
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to fetch agencies.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch agencies.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, [token]);
  
  const filteredAgencies = useMemo(() => {
    return agencies.filter(agency =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agencies, searchTerm]);

  const totalPages = Math.ceil(filteredAgencies.length / ITEMS_PER_PAGE);

  const paginatedAgencies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAgencies.slice(startIndex, endIndex);
  }, [filteredAgencies, currentPage]);

  const handleAddAgency = async (newAgency: Omit<Agency, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAgency),
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Agency Added', description: `${newAgency.name} has been successfully added.` });
        fetchAgencies();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to add agency.' });
        return false;
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add agency.' });
      return false;
    }
  };
  
  const handleUpdateAgency = async (updatedAgency: Omit<Agency, 'createdAt' | 'updatedAt'>) => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies/${updatedAgency.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedAgency),
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Agency Updated', description: `${updatedAgency.name} has been successfully updated.` });
        fetchAgencies();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update agency.' });
        return false;
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update agency.' });
      return false;
    }
  };

  const handleDeleteClick = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditClick = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = async (agency: Agency) => {
    if (!token) return;
    const newStatus = agency.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies/${agency.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Status Updated', description: `${agency.name} is now ${newStatus}.`});
        fetchAgencies();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  }

  const confirmDelete = async () => {
    if (!selectedAgency || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies/${selectedAgency.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) handleApiError(response);

      if (response.ok) {
        toast({
          title: 'Agency Deleted',
          description: `${selectedAgency.name} has been deleted.`,
          variant: 'destructive'
        });
        fetchAgencies();
      } else {
         toast({ variant: 'destructive', title: 'Error', description: "Could not delete agency." });
      }

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during deletion.' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAgency(null);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Agency Management">
        <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search agencies..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button size="sm" className="h-9 gap-1" onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Agency
              </span>
            </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Agencies</CardTitle>
          <CardDescription>
            Manage your gas distribution agencies.
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
                  <TableHead>Agency Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined On</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAgencies.map((agency: Agency) => (
                  <TableRow key={agency.id}>
                    <TableCell className="font-medium">{agency.name}</TableCell>
                    <TableCell>
                      <div>{agency.phone}</div>
                      <div className="text-sm text-muted-foreground">{agency.email}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{`${agency.address}, ${agency.city}, ${agency.pincode}`}</TableCell>
                    <TableCell>
                        <Badge className={cn('capitalize', {
                            'bg-green-500 text-white': agency.status === 'active',
                            'bg-red-500 text-white': agency.status === 'inactive'
                        })}>
                            {agency.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{new Date(agency.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(agency)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(agency)}>
                            Set as {agency.status === 'active' ? 'Inactive' : 'Active'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(agency)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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
              Showing {paginatedAgencies.length} of {filteredAgencies.length} agencies.
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
      
      <AddAgencyDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAgencyAdd={handleAddAgency}
      />
      {selectedAgency && (
        <EditAgencyDialog
          agency={selectedAgency}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onAgencyUpdate={handleUpdateAgency}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the agency
              and remove its data from our servers.
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

    
