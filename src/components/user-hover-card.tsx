
"use client"

import { useEffect, useState, useContext } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { AuthContext, useAuth } from '@/context/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function UserHoverCard({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const { token } = useContext(AuthContext);
  const { handleApiError } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
         const response = await fetch(`${API_BASE_URL}/api/users?limit=10`, { // Fetch last 10 users
             headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
          setUsers(result.data.users);
        }
      } catch (error) {
        console.error("Failed to load users for hover card", error);
      }
    };
    fetchUsers();
  }, [token, handleApiError]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <h4 className="font-semibold mb-2">Recent Customers</h4>
        <ScrollArea className="h-48">
          <div className="space-y-4">
            {users.length > 0 ? users.map(user => (
              <div key={user.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={`https://picsum.photos/seed/${user.id}/40`} data-ai-hint="person portrait" />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )) : (
               <p className="text-sm text-muted-foreground text-center pt-4">No recent customers found.</p>
            )}
          </div>
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
}
