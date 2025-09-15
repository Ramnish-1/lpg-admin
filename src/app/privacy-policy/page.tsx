
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Loader2, ChevronDown } from 'lucide-react';
import type { PrivacyPolicy } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { AddPolicyDialog } from '@/components/add-policy-dialog';
import { EditPolicyDialog } from '@/components/edit-policy-dialog';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function PrivacyPolicyPage() {
  const [policies, setPolicies] = useState<PrivacyPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<PrivacyPolicy | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();

  const fetchPolicies = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/privacy-policies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        setPolicies(result.data.policies || []);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to fetch policies.' });
        setPolicies([]);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch policies.' });
      setPolicies([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, toast, handleApiError]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const totalPages = Math.ceil(policies.length / ITEMS_PER_PAGE);

  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return policies.slice(startIndex, endIndex);
  }, [policies, currentPage]);

  const handleAddPolicy = async (newPolicy: Omit<PrivacyPolicy, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/privacy-policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPolicy),
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Policy Added', description: `Policy "${newPolicy.title}" has been successfully added.` });
        fetchPolicies();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to add policy.' });
        return false;
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add policy.' });
      return false;
    }
  };
  
  const handleUpdatePolicy = async (updatedPolicy: Omit<PrivacyPolicy, 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!token) return false;
    const { id, ...payload } = updatedPolicy;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/privacy-policies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Policy Updated', description: `Policy "${updatedPolicy.title}" has been successfully updated.` });
        fetchPolicies();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update policy.' });
        return false;
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update policy.' });
      return false;
    }
  };

  const handleDeleteClick = (policy: PrivacyPolicy) => {
    setSelectedPolicy(policy);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditClick = (policy: PrivacyPolicy) => {
    setSelectedPolicy(policy);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPolicy || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/privacy-policies/${selectedPolicy.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) handleApiError(response);

      if (response.ok) {
        toast({
          title: 'Policy Deleted',
          description: `Policy "${selectedPolicy.title}" has been deleted.`,
          variant: 'destructive'
        });
        fetchPolicies();
      } else {
         toast({ variant: 'destructive', title: 'Error', description: "Could not delete policy." });
      }

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during deletion.' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPolicy(null);
    }
  };
  
  const handleToggleStatus = async (policyToToggle: PrivacyPolicy) => {
    if (!token) return;
    const newStatus = policyToToggle.status.toLowerCase() === 'active' ? 'inactive' : 'active';
    try {
       const response = await fetch(`${API_BASE_URL}/api/admin/privacy-policies/${policyToToggle.id}/status`, {
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
            toast({
                title: 'Status Updated',
                description: `Policy status is now ${newStatus}.`,
            });
            fetchPolicies();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  return (
    <AppShell>
      <PageHeader title="Privacy Policy">
        <Button size="sm" className="h-9 gap-1" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Policy
          </span>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Manage Privacy Policies</CardTitle>
          <CardDescription>
            Create, edit, and manage your application's privacy policies.
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
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPolicies.map((policy: PrivacyPolicy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium max-w-sm truncate">{policy.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{policy.version}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-28 justify-between capitalize" onClick={(e) => e.stopPropagation()}>
                                <span className={cn({
                                    'text-green-600': policy.status === 'active',
                                    'text-gray-500': policy.status === 'inactive'
                                })}>
                                    {policy.status}
                                </span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => handleToggleStatus(policy)}>
                                Set as {policy.status === 'active' ? 'Inactive' : 'Active'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{new Date(policy.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(policy)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(policy)}>
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
              Showing {paginatedPolicies.length} of {policies.length} policies.
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
      
      <AddPolicyDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPolicyAdd={handleAddPolicy}
      />
      {selectedPolicy && (
        <EditPolicyDialog
          policy={selectedPolicy}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onPolicyUpdate={handleUpdatePolicy}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this policy.
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
