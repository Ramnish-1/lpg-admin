
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FileDown, Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useMemo, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UserDetailsDialog } from '@/components/user-details-dialog';
import { AuthContext } from '@/context/auth-context';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/customers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            const fetchedUsers = result.data.customers.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                address: u.addresses?.[0]?.address || 'No address provided',
                status: 'Active', // Assuming all fetched users are active
                createdAt: new Date(u.createdAt),
                orderHistory: [],
                location: { lat: 0, lng: 0 },
                profileImage: u.profileImage,
            }));
            setUsers(fetchedUsers);
            setFilteredUsers(fetchedUsers);
        } else {
             toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to fetch customers.' });
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch customers.' });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [token, toast]);
  
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setCurrentPage(1);
    const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.phone.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleShowDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  }

  const handleAddressClick = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  }

  const handleExport = () => {
    const csvHeader = "Customer ID,Name,Email,Phone,Address,Status,Registered On\n";
    const csvRows = filteredUsers.map(u => {
        const row = [
            u.id,
            `"${u.name}"`,
            u.email,
            u.phone,
            `"${u.address.replace(/"/g, '""')}"`,
            u.status,
            new Date(u.createdAt).toISOString()
        ].join(',');
        return row;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'customers_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <AppShell>
      <PageHeader title="Customer Management">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
           <CardTitle>Customers</CardTitle>
            <div className="mt-4">
                <Input 
                    placeholder="Search customers..." 
                    className="max-w-xs" 
                    onChange={handleSearch}
                />
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Registered On</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user: User) => (
                    <TableRow key={user.id} onClick={() => handleShowDetails(user)} className="cursor-pointer">
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div 
                          className="text-sm text-muted-foreground hover:underline md:hidden"
                          onClick={(e) => handleAddressClick(e, user.address)}
                        >
                          {user.address}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <a href={`tel:${user.phone}`} onClick={(e) => e.stopPropagation()} className="font-medium hover:underline">{user.phone}</a>
                        <div className="text-sm text-muted-foreground">
                          <a href={`mailto:${user.email}`} onClick={(e) => e.stopPropagation()} className="hover:underline">{user.email}</a>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShowDetails(user)}>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
         {totalPages > 1 && (
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedUsers.length} of {filteredUsers.length} users.
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
      
      <UserDetailsDialog user={selectedUser} isOpen={isDetailsOpen} onOpenChange={setIsDetailsOpen} />

    </AppShell>
  );
}
