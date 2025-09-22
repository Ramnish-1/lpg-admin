

"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Truck,
  Package,
  CreditCard,
  Menu,
  ChevronDown,
  Settings,
  LogOut,
  User as UserIcon,
  UserPlus,
  Bell,
  Check,
  Building2,
  Loader2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ProfileContext } from '@/context/profile-context';
import { SettingsContext } from '@/context/settings-context';
import { useAuth } from '@/context/auth-context';
import { useNotifications } from '@/context/notification-context';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Order } from '@/lib/types';

const GasPump = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M14 11h2v8h-2v-3.5a1.5 1.5 0 0 0-3 0V19H9v-8h2v1.5c.5-.83 1.5-1.5 2.5-1.5zM4 3h15v2H4z" />
    <path d="M18.5 6H10a1 1 0 0 0-1 1v12h10V7a1 1 0 0 0-1-1h-.5zM12 9h6v2h-6V9z" />
    <path d="M8 7H5v12h3V7zm-2 2h1v2H6V9z" />
  </svg>
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/agents', label: 'Delivery Agents', icon: Truck },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/agencies', label: 'Agencies', icon: Building2, roles: ['admin', 'super_admin'] },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/add-user', label: 'Manage Users', icon: UserPlus, roles: ['admin', 'super_admin'] },
  { href: '/terms-and-conditions', label: 'Terms & Conditions', icon: FileText, roles: ['admin', 'super_admin'] },
  { href: '/privacy-policy', label: 'Privacy Policy', icon: ShieldCheck, roles: ['admin', 'super_admin'] },
];

interface AppShellProps {
  children: React.ReactNode;
  onConfirmAndAssignFromNotification?: (order: Order) => void;
  orders?: Order[];
}


export function AppShell({ children, onConfirmAndAssignFromNotification, orders }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { profile } = React.useContext(ProfileContext);
  const { settings } = React.useContext(SettingsContext);
  const { isAuthenticated, logout } = useAuth();
  const { notifications } = useNotifications();
  const [confirmingOrderId, setConfirmingOrderId] = React.useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = allNavItems.filter(item => {
    if (item.roles) {
      const userRole = profile.role?.toLowerCase() || '';
      return item.roles.includes(userRole);
    }
    return true;
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);


  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  }

  const handleNotificationClick = (orderId: string) => {
    router.push('/orders');
  }

  const handleConfirmOrder = async (e: React.MouseEvent, orderId: string) => {
      e.stopPropagation();
      setConfirmingOrderId(orderId);
      
      const order = orders?.find(o => o.id === orderId);

      if (onConfirmAndAssignFromNotification && order) {
        if (pathname !== '/orders') {
          router.push(`/orders?assignAgent=${orderId}`);
        } else {
          onConfirmAndAssignFromNotification(order);
        }
      }
      setConfirmingOrderId(null);
  }

  const appNameToDisplay = profile.role === 'agency_owner' ? 'GasTrack Agency' : settings.appName;

  const sidebarNav = (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === href && 'bg-muted text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
  
  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  const displayPhotoUrl = profile.photoUrl?.startsWith('https://') || profile.photoUrl?.startsWith('blob:')
    ? profile.photoUrl 
    : profile.photoUrl ? `${API_BASE_URL}/${profile.photoUrl}` : '';

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <GasPump className="h-6 w-6 text-primary" />
              <span className="">{appNameToDisplay}</span>
            </Link>
          </div>
          <div className="flex-1">
            {sidebarNav}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="flex h-14 items-center border-b mb-4">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <GasPump className="h-6 w-6 text-primary" />
                    <span className="">{appNameToDisplay}</span>
                  </Link>
              </div>
              {sidebarNav}
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
           {profile.role === 'agency_owner' && profile.agencyStatus && (
               <div className="flex items-center gap-2">
                    <Badge 
                        variant={profile.agencyStatus === 'active' ? 'default' : 'destructive'}
                        className="capitalize flex items-center gap-1.5"
                    >
                         <span className={cn("h-2 w-2 rounded-full", {
                            'bg-green-400': profile.agencyStatus === 'active',
                            'bg-red-400': profile.agencyStatus === 'inactive'
                        })} />
                        {profile.agencyStatus}
                    </Badge>
                </div>
            )}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{unreadCount}</Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Pending Orders</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">No pending orders.</p>
                ) : (
                    notifications.map(n => (
                        <DropdownMenuItem key={n.id} onSelect={() => handleNotificationClick(n.orderId)} className={cn("flex items-start justify-between gap-2 whitespace-normal cursor-pointer", !n.read && "bg-accent/50")}>
                            <div>
                                <p className="font-medium">{n.message}</p>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(n.timestamp, { addSuffix: true })}</p>
                            </div>
                             <Button size="sm" variant="outline" className="h-7 gap-1" onClick={(e) => handleConfirmOrder(e, n.orderId)} disabled={confirmingOrderId === n.orderId}>
                                {confirmingOrderId === n.orderId ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                <span className="ml-1">Confirm</span>
                            </Button>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 flex items-center gap-2 px-2 rounded-md hover:bg-muted hover:text-foreground border border-transparent hover:border-border">
                 <Avatar className="h-8 w-8">
                  <AvatarImage src={displayPhotoUrl} alt="@admin" data-ai-hint="manager portrait" />
                  <AvatarFallback>{profile.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{profile.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <UserIcon className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
                 <LogOut className="h-4 w-4" />
                 <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
