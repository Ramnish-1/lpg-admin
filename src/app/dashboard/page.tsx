
"use client";

import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getDashboardData, getRecentOrders } from '@/lib/data';
import { Users, ShoppingCart, Truck, IndianRupee } from 'lucide-react';
import type { Order, Agent } from '@/lib/types';
import { DashboardChart } from '@/components/dashboard-chart';
import { UserHoverCard } from '@/components/user-hover-card';
import { OrderHoverCard } from '@/components/order-hover-card';
import { AgentHoverCard } from '@/components/agent-hover-card';
import { OrderDetailsDialog } from '@/components/order-details-dialog';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { token } = useContext(AuthContext);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    activeAgents: 0,
    totalAgents: 0,
    totalRevenue: 0,
  });
  const [ordersByDay, setOrdersByDay] = useState<{ day: string; orders: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !token) return;

    const fetchAgents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/delivery-agents', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          const agentData = result.data.agents;
          setAgents(agentData);
          return agentData;
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch agent data for dashboard.' });
          return [];
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch agent data for dashboard.' });
        return [];
      }
    };
    
    const fetchDashboardData = async () => {
      try {
        const agentData = await fetchAgents();
        const { stats: fetchedStats, ordersByDay: fetchedOrdersByDay } = await getDashboardData(agentData);
        setStats(fetchedStats);
        setOrdersByDay(fetchedOrdersByDay);
        const fetchedRecentOrders = await getRecentOrders();
        setRecentOrders(fetchedRecentOrders);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };

    fetchDashboardData();
  }, [isClient, token, toast]);

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Delivered': 'default',
    'Pending': 'secondary',
    'In-progress': 'outline',
    'Cancelled': 'destructive',
  };
  
  if (!isClient) {
    return null;
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
                  <p className="text-xs text-muted-foreground">+2% from last month</p>
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
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
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
              <CardTitle>Orders Overview (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardChart ordersByDay={ordersByDay} />
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
                          <div className="text-sm text-muted-foreground">#{order.id.slice(0, 6)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">₹{order.totalAmount.toLocaleString()}</TableCell>
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
