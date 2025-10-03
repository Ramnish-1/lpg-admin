'use client';

import React from 'react';
import { useSocket } from '@/context/socket-context';
import { useForceLogout } from '@/hooks/use-force-logout';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SocketStatusProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'compact';
}

export const SocketStatus: React.FC<SocketStatusProps> = ({ 
  className, 
  showText = true, 
  variant = 'default' 
}) => {
  const { isConnected } = useSocket();
  const { isListening } = useForceLogout();

  const statusText = isConnected ? 'Live' : 'Offline';
  const statusColor = isConnected ? 'bg-green-500' : 'bg-red-500';
  const badgeVariant = isConnected ? 'default' : 'destructive';

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              <div className={cn("w-2 h-2 rounded-full", statusColor)} />
              {showText && (
                <span className="text-xs text-muted-foreground">
                  {statusText}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p>Socket: {isConnected ? 'Connected' : 'Disconnected'}</p>
              <p>Force Logout: {isListening ? 'Active' : 'Inactive'}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md bg-muted", className)}>
      <div className={cn("w-2 h-2 rounded-full", statusColor)} />
      {showText && (
        <span className="text-xs text-muted-foreground">
          {statusText}
        </span>
      )}
      {isListening && (
        <Badge variant="outline" className="text-xs px-1 py-0">
          Protected
        </Badge>
      )}
    </div>
  );
};
