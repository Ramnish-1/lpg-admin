
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FileDown } from 'lucide-react';
import { getUsersData } from '@/lib/data';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
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

const USERS_STORAGE_KEY = 'gastrack-users';


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'Block' | 'Unblock' | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const savedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers).map((u: any) => ({
            ...u,
            createdAt: new Date(u.createdAt),
          }));
          setUsers(parsedUsers);
          setFilteredUsers(parsedUsers);
        } else {
          const data = await getUsersData();
          setUsers(data);
          setFilteredUsers(data);
          window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to load users from localStorage", error);
        const data = await getUsersData();
        setUsers(data);
        setFilteredUsers(data);
      }
    };
    fetchUsers();
  }, []);

  const updateUsersStateAndStorage = (newUsers: User[]) => {
    setUsers(newUsers);
    setFilteredUsers(newUsers); // Keep filtered view in sync or re-apply filter
    try {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
    } catch (error) {
      console.error("Failed to save users to localStorage", error);
    }
  };
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.phone.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleAction = (user: User, userAction: 'Block' | 'Unblock') => {
    setSelectedUser(user);
    setAction(userAction);
    setIsConfirmOpen(true);
  };
  
  const confirmAction = () => {
    if (selectedUser && action) {
      const newStatus = action === 'Block' ? 'Blocked' : 'Active';
      const updatedUsers = users.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u)
      updateUsersStateAndStorage(updatedUsers);

      toast({
        title: `User ${action === 'Block' ? 'Blocked' : 'Unblocked'}`,
        description: `${selectedUser.name} has been ${action.toLowerCase()}ed.`,
        variant: action === 'Block' ? 'destructive' : 'default',
      });
      setIsConfirmOpen(false);
      setSelectedUser(null);
      setAction(null);
    }
  }


  return (
    <AppShell>
      <PageHeader title="User Management">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
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
                    placeholder="Search users by name, email or phone..." 
                    className="max-w-sm" 
                    onChange={handleSearch}
                />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered On</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.address}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{user.phone}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {user.status === 'Active' ? (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleAction(user, 'Block')}>Block</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction(user, 'Unblock')}>Unblock</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to {action?.toLowerCase()} this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className={action === 'Block' ? 'bg-destructive hover:bg-destructive/90' : ''}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
