
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Loader2, ChevronDown } from 'lucide-react';
import type { TermsAndCondition } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { AddTermsDialog } from '@/components/add-terms-dialog';
import { EditTermsDialog } from '@/components/edit-terms-dialog';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function TermsPage() {
  const [terms, setTerms] = useState<TermsAndCondition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<TermsAndCondition | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();

  const fetchTerms = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/terms-and-conditions`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        setTerms(result.data.termsAndConditions || []);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to fetch terms.' });
        setTerms([]);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch terms.' });
      setTerms([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, toast, handleApiError]);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const totalPages = Math.ceil(terms.length / ITEMS_PER_PAGE);

  const paginatedTerms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return terms.slice(startIndex, endIndex);
  }, [terms, currentPage]);

  const handleAddTerm = async (newTerm: Omit<TermsAndCondition, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'version'>) => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/terms-and-conditions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(newTerm),
      });
      const result = await response.json();
      if (!response.ok) {
          toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to add term.' });
          return false;
      }
      
      toast({ title: 'Term Added', description: `Term "${newTerm.title}" has been successfully added.` });
      fetchTerms();
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add term.' });
      return false;
    }
  };
  
  const handleUpdateTerm = async (updatedTerm: Omit<TermsAndCondition, 'createdAt' | 'updatedAt' | 'status' | 'version'>) => {
    if (!token) return false;
    const { id, ...payload } = updatedTerm;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/terms-and-conditions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update term.' });
        return false;
      }
      
      toast({ title: 'Term Updated', description: `Term "${updatedTerm.title}" has been successfully updated.` });
      fetchTerms();
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update term.' });
      return false;
    }
  };

  const handleDeleteClick = (term: TermsAndCondition) => {
    setSelectedTerm(term);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditClick = (term: TermsAndCondition) => {
    setSelectedTerm(term);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTerm || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/terms-and-conditions/${selectedTerm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      if (!response.ok) handleApiError(response);

      if (response.ok) {
        toast({
          title: 'Term Deleted',
          description: `Term "${selectedTerm.title}" has been deleted.`,
          variant: 'destructive'
        });
        fetchTerms();
      } else {
         toast({ variant: 'destructive', title: 'Error', description: "Could not delete term." });
      }

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during deletion.' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedTerm(null);
    }
  };
  
  const handleToggleStatus = async (termToToggle: TermsAndCondition) => {
    if (!token) return;
    const newStatus = termToToggle.status.toLowerCase() === 'active' ? 'inactive' : 'active';
    try {
       const response = await fetch(`${API_BASE_URL}/api/admin/terms-and-conditions/${termToToggle.id}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
            toast({
                title: 'Status Updated',
                description: `Term status is now ${newStatus}.`,
            });
            fetchTerms();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  return (
    <AppShell>
      <PageHeader title="Terms &amp; Conditions">
        <Button size="sm" className="h-9 gap-1" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Term
          </span>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Manage Terms &amp; Conditions</CardTitle>
          <CardDescription>
            Create, edit, and manage your application's terms and conditions.
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
                {paginatedTerms.map((term: TermsAndCondition) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium max-w-sm truncate">{term.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{term.version}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-28 justify-between capitalize" onClick={(e) => e.stopPropagation()}>
                                <span className={cn({
                                    'text-green-600': term.status === 'active',
                                    'text-gray-500': term.status === 'inactive'
                                })}>
                                    {term.status}
                                </span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => handleToggleStatus(term)}>
                                Set as {term.status === 'active' ? 'Inactive' : 'Active'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{new Date(term.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(term)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(term)}>
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
              Showing {paginatedTerms.length} of {terms.length} terms.
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
      
      <AddTermsDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTermAdd={handleAddTerm}
      />
      {selectedTerm && (
        <EditTermsDialog
          term={selectedTerm}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onTermUpdate={handleUpdateTerm}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this term.
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
