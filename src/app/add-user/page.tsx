
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useMemo } from 'react';
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
} from "@/components/ui/alert-dialog";
import { UserDetailsDialog } from '@/components/user-details-dialog';
import { AddUserDialog } from '@/components/add-user-dialog';


const ITEMS_PER_PAGE = 10;


export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'Block' | 'Unblock' | 'Delete' | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    // NOTE: This page still uses mock data.
    // Replace with API call to fetch admin users.
    const initialUsers: User[] = []; 
    setUsers(initialUsers);
    setFilteredUsers(initialUsers);
  }, []);
  
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);


  const updateUsersState = (newUsers: User[]) => {
    setUsers(newUsers);
    const currentSearchTerm = (document.querySelector('input[placeholder="Search users..."]') as HTMLInputElement)?.value || '';
    if (currentSearchTerm) {
        const filtered = newUsers.filter(user => 
            user.name.toLowerCase().includes(currentSearchTerm) ||
            user.email.toLowerCase().includes(currentSearchTerm) ||
            user.phone.toLowerCase().includes(currentSearchTerm)
        );
        setFilteredUsers(filtered);
    } else {
        setFilteredUsers(newUsers);
    }
  };
  
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

  const handleAction = (user: User, userAction: 'Block' | 'Unblock' | 'Delete') => {
    setSelectedUser(user);
    setAction(userAction);
    setIsConfirmOpen(true);
  };

  const handleShowDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  }
  
  const confirmAction = () => {
    if (selectedUser && action) {
      let updatedUsers;
      let toastTitle = '';
      let toastDescription = '';
      let toastVariant: 'default' | 'destructive' = 'default';

      if (action === 'Delete') {
        updatedUsers = users.filter(u => u.id !== selectedUser.id);
        toastTitle = 'User Deleted';
        toastDescription = `${selectedUser.name} has been permanently deleted.`;
        toastVariant = 'destructive';
      } else {
        const newStatus = action === 'Block' ? 'Blocked' : 'Active';
        updatedUsers = users.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u)
        toastTitle = `User ${action === 'Block' ? 'Blocked' : 'Unblocked'}`;
        toastDescription = `${selectedUser.name} has been ${action.toLowerCase()}ed.`;
        toastVariant = action === 'Block' ? 'destructive' : 'default';
      }
      
      updateUsersState(updatedUsers);
      
      toast({
        title: toastTitle,
        description: toastDescription,
        variant: toastVariant,
      });

      setIsConfirmOpen(false);
      setSelectedUser(null);
      setAction(null);
    }
  }

  const handleAddUser = (newUser: Omit<User, 'id' | 'createdAt' | 'status' | 'orderHistory' | 'location' | 'address'>): boolean => {
     const userExists = users.some(u => u.email === newUser.email);
      if (userExists) {
        toast({
            variant: 'destructive',
            title: 'User Creation Failed',
            description: 'An account with this email already exists.',
        });
        return false;
      }

      const userToAdd: User = {
        ...newUser,
        id: `usr_${Date.now()}`,
        createdAt: new Date(),
        status: 'Active',
        orderHistory: [],
        location: { lat: 0, lng: 0 },
        address: ''
      };
      const newUsers = [...users, userToAdd];
      updateUsersState(newUsers);
      toast({
        title: 'User Created',
        description: `${newUser.name} has been added successfully.`,
      });
      setIsAddUserOpen(false);
      return true;
  }

  return (
    <AppShell>
      <PageHeader title="User Administration">
        <Button size="sm" className="h-8 gap-1" onClick={() => setIsAddUserOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add User
            </span>
          </Button>
      </PageHeader>
      <Card>
        <CardHeader>
           <CardTitle>Registered Users</CardTitle>
            <div className="mt-4">
                <Input 
                    placeholder="Search users..." 
                    className="max-w-xs" 
                    onChange={handleSearch}
                />
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
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
                      <div className="text-sm text-muted-foreground">
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
                          {user.status === 'Active' ? (
                            <DropdownMenuItem className="text-destructive" onClick={() => handleAction(user, 'Block')}>Block</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleAction(user, 'Unblock')}>Unblock</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleAction(user, 'Delete')}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'Delete'
                ? 'This action cannot be undone. This will permanently delete the user account.'
                : `This will ${action?.toLowerCase()} the user. This action can be reversed later.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className={action === 'Block' || action === 'Delete' ? 'bg-destructive hover:bg-destructive/90' : ''}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddUserDialog 
        isOpen={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onAddUser={handleAddUser}
      />

      <UserDetailsDialog user={selectedUser} isOpen={isDetailsOpen} onOpenChange={setIsDetailsOpen} />

    </AppShell>
  );
}
