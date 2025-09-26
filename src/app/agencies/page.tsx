
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Loader2, ChevronDown, Filter } from 'lucide-react';
import type { Agency } from '@/lib/types';
import { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext, useAuth } from '@/context/auth-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AddAgencyDialog } from '@/components/add-agency-dialog';
import { EditAgencyDialog } from '@/components/edit-agency-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AgencyDetailsDialog } from '@/components/agency-details-dialog';
import { ProfileContext } from '@/context/profile-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [activeAgencies, setActiveAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('all');
  const { profile } = useContext(ProfileContext);
  const isAdmin = profile.role === 'admin';

  const fetchAgencies = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setAgencies(result.data.agencies.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt)})));
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to fetch agencies.' });
      }
    } catch (error) {
      console.error("Failed to fetch agencies:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while fetching agencies.' });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast, handleApiError]);

  const fetchActiveAgencies = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies/active`, {
         headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
       if (!response.ok) {
        handleApiError(response);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setActiveAgencies(result.data.agencies);
      }
    } catch (error) {
      console.error("Failed to fetch active agencies:", error);
    }
  }, [token, isAdmin, handleApiError]);


  useEffect(() => {
    fetchAgencies();
    fetchActiveAgencies();
  }, [fetchAgencies, fetchActiveAgencies]);
  
  const filteredAgencies = useMemo(() => {
    let agenciesToFilter = agencies;

    if (selectedAgencyFilter !== 'all') {
      agenciesToFilter = agenciesToFilter.filter(agency => agency.id === selectedAgencyFilter);
    }

    return agenciesToFilter.filter(agency =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agencies, searchTerm, selectedAgencyFilter]);

  const totalPages = Math.ceil(filteredAgencies.length / ITEMS_PER_PAGE);

  const paginatedAgencies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAgencies.slice(startIndex, endIndex);
  }, [filteredAgencies, currentPage]);

  const handleAddAgency = async (newAgency: Omit<Agency, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'image'>, image?: File): Promise<boolean> => {
    if (!token) return false;

    const formData = new FormData();
    Object.entries(newAgency).forEach(([key, value]) => {
        formData.append(key, String(value));
    });
    if (image) {
        formData.append('image', image);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData,
      });
      const result = await response.json();

       if (!response.ok) {
          toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to add agency.' });
          return false;
        }

      if (result.success) {
        toast({ title: 'Agency Added', description: `${newAgency.name} has been successfully added.` });
        fetchAgencies();
        fetchActiveAgencies();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to add agency.' });
        return false;
      }
    } catch (error) {
      console.error("Failed to add agency:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while adding the agency.' });
      return false;
    }
  };
  
  const handleUpdateAgency = async (updatedAgency: Omit<Agency, 'createdAt' | 'updatedAt' | 'status' | 'image'> & { id: string }, image?: File): Promise<boolean> => {
    if (!token) return false;
    const { id, ...payload } = updatedAgency;
    
    const formData = new FormData();
     Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, String(value));
    });
    if (image) {
        formData.append('image', image);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update agency.' });
        return false;
      }

      if (result.success) {
        toast({ title: 'Agency Updated', description: `${updatedAgency.name} has been successfully updated.` });
        fetchAgencies();
        fetchActiveAgencies();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update agency.' });
        return false;
      }
    } catch (error) {
      console.error("Failed to update agency:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while updating the agency.' });
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

  const handleDetailsClick = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsDetailsDialogOpen(true);
  }

  const confirmDelete = async () => {
    if (!selectedAgency || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies/${selectedAgency.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      
      if (response.ok) {
        toast({
          title: 'Agency Deleted',
          description: `${selectedAgency.name} has been deleted.`,
          variant: 'destructive'
        });
        fetchAgencies();
        fetchActiveAgencies();
      } else {
         const result = await response.json();
         toast({ variant: 'destructive', title: 'Error', description: result.error || "Could not delete agency." });
      }

    } catch (error) {
      console.error("Failed to delete agency:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred during deletion.' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAgency(null);
    }
  };

  const handleToggleStatus = async (agency: Agency, newStatus: 'active' | 'inactive') => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies/${agency.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      if (!response.ok) {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
        return;
      }
      
      if (result.success) {
        toast({
            title: 'Status Updated',
            description: `${agency.name}'s status is now ${newStatus}.`,
        });
        fetchAgencies();
        fetchActiveAgencies();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
      }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Agencies</CardTitle>
            <CardDescription>
              Manage your gas distribution agencies.
            </CardDescription>
          </div>
          {isAdmin && activeAgencies.length > 0 && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                           <Filter className="h-4 w-4"/>
                           <span>Filter by Agency</span>
                           <ChevronDown className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={selectedAgencyFilter} onValueChange={setSelectedAgencyFilter}>
                            <DropdownMenuRadioItem value="all">All Agencies</DropdownMenuRadioItem>
                            {activeAgencies.map(agency => (
                                <DropdownMenuRadioItem key={agency.id} value={agency.id}>{agency.name}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
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
                  <TableRow key={agency.id} onClick={() => handleDetailsClick(agency)} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={agency.image ? `${API_BASE_URL}/${agency.image}` : undefined} alt={agency.name} />
                          <AvatarFallback>{agency.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {agency.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{agency.phone}</div>
                      <div className="text-sm text-muted-foreground">{agency.email}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{`${agency.address}, ${agency.city}, ${agency.pincode}`}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-28 justify-between capitalize">
                                <span className={cn({
                                    'text-green-600': agency.status === 'active',
                                    'text-gray-500': agency.status === 'inactive'
                                })}>
                                    {agency.status}
                                </span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(agency, 'active')}
                              disabled={agency.status === 'active'}
                            >
                                Set as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(agency, 'inactive')}
                              disabled={agency.status === 'inactive'}
                              className="text-destructive"
                            >
                                Set as Inactive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{new Date(agency.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDetailsClick(agency)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(agency)}>Edit</DropdownMenuItem>
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
      <AgencyDetailsDialog
        agency={selectedAgency}
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
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
