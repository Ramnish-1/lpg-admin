
"use client";

import { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingCart, Truck, IndianRupee, Loader2, Building2 } from 'lucide-react';
import type { Order, Agent } from '@/lib/types';
import { UserHoverCard } from '@/components/user-hover-card';
import { OrderHoverCard } from '@/components/order-hover-card';
import { AgentHoverCard } from '@/components/agent-hover-card';
import { OrderDetailsDialog } from '@/components/order-details-dialog';
import { AuthContext, useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { OrderStatusChart } from '@/components/order-status-chart';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const RECENT_ORDERS_PER_PAGE = 5;

export default function DashboardPage() {
  const { token } = useContext(AuthContext);
  const { handleApiError } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    activeAgents: 0,
    totalAgents: 0,
    totalRevenue: 0,
    totalAgencies: 0,
  });
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [recentOrdersCurrentPage, setRecentOrdersCurrentPage] = useState(1);

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
        });

        if (!response.ok) {
            handleApiError(response);
            return;
        }
        
        const result = await response.json();
        
        if (result.success) {
          const { totals, orders: ordersData, recent, agencies } = result.data;
          
          const activeAgentsCount = ordersData.perAgent.filter((a: any) => a.DeliveryAgent?.status === 'online').length;
          const totalDeliveredRevenue = recent.orders.reduce((acc: number, order: Order) => {
            if (order.status === 'delivered') {
                return acc + parseFloat(order.totalAmount);
            }
            return acc;
          }, 0);
          
          setStats({
            totalUsers: totals.users,
            totalOrders: totals.orders,
            totalAgents: totals.agents,
            activeAgents: activeAgentsCount,
            totalRevenue: totalDeliveredRevenue,
            totalAgencies: totals.agencies,
          });
          
          // Assuming byStatus gives daily data for the last 7 days by default.
          // This will need to be adjusted based on actual API capabilities.
          // For now, let's create some dummy data based on the response.
           const { byStatus } = ordersData;
           const chartData = Object.keys(byStatus).map(status => ({
              status,
              ...byStatus[status]
           }));
           // This is just a placeholder, the OrderStatusChart will have its own data fetching logic.
           setOrdersByStatus([]);


          setRecentOrders(recent.orders || []);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to process dashboard data.' });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while fetching dashboard data.' });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token, toast, handleApiError]);

  const recentOrdersTotalPages = Math.ceil(recentOrders.length / RECENT_ORDERS_PER_PAGE);

  const paginatedRecentOrders = useMemo(() => {
    const startIndex = (recentOrdersCurrentPage - 1) * RECENT_ORDERS_PER_PAGE;
    const endIndex = startIndex + RECENT_ORDERS_PER_PAGE;
    return recentOrders.slice(startIndex, endIndex);
  }, [recentOrders, recentOrdersCurrentPage]);


  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'delivered': 'default',
    'pending': 'secondary',
    'confirmed': 'secondary',
    'in-progress': 'outline',
    'assigned': 'outline',
    'out-for-delivery': 'outline',
    'cancelled': 'destructive',
    'returned': 'destructive',
  };
  
  if (isLoading) {
    return (
        <AppShell>
            <PageHeader title="Dashboard" />
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader title="Dashboard" />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/customers">
            <UserHoverCard>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
            </UserHoverCard>
          </Link>
          <Link href="/orders">
            <OrderHoverCard>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>
            </OrderHoverCard>
          </Link>
          <Link href="/agents">
            <AgentHoverCard>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeAgents}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalAgents} total agents</p>
                </CardContent>
              </Card>
            </AgentHoverCard>
          </Link>
          <Link href="/agencies">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAgencies}</div>
                </CardContent>
              </Card>
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <OrderStatusChart />
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecentOrders.map((order: Order) => (
                      <TableRow key={order.id} onClick={() => handleShowDetails(order)} className="cursor-pointer">
                        <TableCell className="py-2">
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">#{order.orderNumber.slice(-8)}</div>
                        </TableCell>
                        <TableCell className="py-2">
                           <Badge variant={statusVariant[order.status.replace('_', '-')] || 'secondary'} className="capitalize">{order.status.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell py-2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right py-2">₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
             {recentOrdersTotalPages > 1 && (
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {paginatedRecentOrders.length} of {recentOrders.length} orders.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecentOrdersCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={recentOrdersCurrentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {recentOrdersCurrentPage} of {recentOrdersTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecentOrdersCurrentPage(prev => Math.min(prev + 1, recentOrdersTotalPages))}
                    disabled={recentOrdersCurrentPage === recentOrdersTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      {selectedOrder && (
          <OrderDetailsDialog 
            order={selectedOrder}
            isOpen={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            onConfirmAndAssign={() => {}}
            onCancelOrder={() => {}}
            isUpdating={false}
          />
      )}
    </AppShell>
  );
}
