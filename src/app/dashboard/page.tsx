
"use client";

import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingCart, Truck, IndianRupee, Loader2 } from 'lucide-react';
import type { Order, Agent } from '@/lib/types';
import { SalesChart } from '@/components/sales-chart';
import { UserHoverCard } from '@/components/user-hover-card';
import { OrderHoverCard } from '@/components/order-hover-card';
import { AgentHoverCard } from '@/components/agent-hover-card';
import { OrderDetailsDialog } from '@/components/order-details-dialog';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DashboardPage() {
  const { token } = useContext(AuthContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    activeAgents: 0,
    totalAgents: 0,
    totalRevenue: 0,
  });
  const [salesByDay, setSalesByDay] = useState<{ day: string; totalRevenue: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [dashboardResponse, agentsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/delivery-agents`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const dashboardResult = await dashboardResponse.json();
        const agentsResult = await agentsResponse.json();

        let totalAgents = 0;
        let activeAgents = 0;

        if (agentsResult.success) {
          const agents: Agent[] = agentsResult.data.agents;
          totalAgents = agents.length;
          activeAgents = agents.filter(a => a.status.toLowerCase() === 'online').length;
        } else {
           toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch agent data.' });
        }
        
        if (dashboardResult.success) {
          const { stats: dashboardStats, salesByDay, recentOrders } = dashboardResult.data;
          setStats({
            totalUsers: dashboardStats.totalUsers,
            totalOrders: dashboardStats.totalOrders,
            totalRevenue: dashboardStats.totalRevenue,
            totalAgents,
            activeAgents,
          });
          setSalesByDay(salesByDay);
          setRecentOrders(recentOrders);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch dashboard data.' });
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch dashboard data.' });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token, toast]);

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'delivered': 'default',
    'pending': 'secondary',
    'in-progress': 'outline',
    'cancelled': 'destructive',
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Based on delivered orders</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart salesByDay={salesByDay} />
            </CardContent>
          </Card>
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
                    {recentOrders.map((order: Order) => (
                      <TableRow key={order.id} onClick={() => handleShowDetails(order)} className="cursor-pointer">
                        <TableCell>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">#{order.orderNumber.slice(-8)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[order.status] || 'secondary'}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <OrderDetailsDialog 
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </AppShell>
  );
}
