"use client"

import { useEffect, useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsersData } from "@/lib/data";
import { User } from "@/lib/types";

export function UserHoverCard({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsersData().then(setUsers);
  }, []);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <h4 className="font-semibold mb-2">Users</h4>
        <ScrollArea className="h-48">
          <div className="space-y-4">
            {users.map(user => (
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
            ))}
          </div>
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
}
