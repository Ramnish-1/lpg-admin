
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, FileDown } from 'lucide-react';
import { getOrdersData, getAgentsData } from '@/lib/data';
import type { Order, Agent } from '@/lib/types';
import { useEffect, useState } from 'react';
import { OrderDetailsDialog } from '@/components/order-details-dialog';
import { AssignAgentDialog } from '@/components/assign-agent-dialog';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ORDERS_STORAGE_KEY = 'gastrack-orders';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Delivered': 'default',
  'Pending': 'secondary',
  'In-progress': 'outline',
  'Cancelled': 'destructive',
};

function OrdersTable({ orders, onShowDetails, onAssignAgent, onCancelOrder }: { 
  orders: Order[],
  onShowDetails: (order: Order) => void,
  onAssignAgent: (order: Order) => void,
  onCancelOrder: (order: Order) => void
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Agent</TableHead>
                <TableHead className="hidden md:table-cell">Amount</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: Order) => (
                <TableRow key={order.id} onClick={() => onShowDetails(order)} className="cursor-pointer">
                  <TableCell className="font-medium text-primary">#{order.id.slice(0, 6)}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.agentName ? (
                      <Badge variant="outline">{order.agentName}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">₹{order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="hidden lg:table-cell">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onShowDetails(order)}>View Details</DropdownMenuItem>
                         {order.status === 'Pending' && (
                          <DropdownMenuItem onClick={() => onAssignAgent(order)}>Assign Agent</DropdownMenuItem>
                        )}
                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                          <DropdownMenuItem onClick={() => onCancelOrder(order)} className="text-destructive">Cancel Order</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const savedOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
            if (savedOrders) {
                const parsedOrders = JSON.parse(savedOrders).map((o: any) => ({
                    ...o,
                    createdAt: new Date(o.createdAt),
                }));
                setOrders(parsedOrders);
            } else {
                const data = await getOrdersData();
                setOrders(data);
                window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(data));
            }
        } catch (error) {
            console.error("Failed to load orders from localStorage", error);
            const data = await getOrdersData();
            setOrders(data);
        }
    };
    const fetchAgents = async () => {
      const data = await getAgentsData();
      setAgents(data);
    }
    fetchOrders();
    fetchAgents();
  }, []);
  
  const updateOrdersStateAndStorage = (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
        window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(newOrders));
    } catch (error) {
        console.error("Failed to save orders to localStorage", error);
    }
  };


  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  const handleAssignAgent = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignOpen(true);
  };
  
  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsCancelOpen(true);
  };

  const handleAgentAssigned = (orderId: string, agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
        const newOrders = orders.map(o => 
            o.id === orderId 
            ? { ...o, assignedAgentId: agentId, agentName: agent.name, agentPhone: agent.phone, status: 'In-progress' as const } 
            : o
        );
        updateOrdersStateAndStorage(newOrders);
        toast({
          title: "Agent Assigned",
          description: `${agent.name} has been assigned to order #${orderId.slice(0, 6)}.`,
        });
    }
  };
  
  const confirmCancelOrder = () => {
    if (selectedOrder) {
      const newOrders = orders.map(o => 
        o.id === selectedOrder.id ? { ...o, status: 'Cancelled' as const, reason: 'Cancelled by admin' } : o
      );
      updateOrdersStateAndStorage(newOrders);
      toast({
        title: 'Order Cancelled',
        description: `Order #${selectedOrder.id.slice(0,6)} has been cancelled.`,
        variant: 'destructive',
      });
      setIsCancelOpen(false);
      setSelectedOrder(null);
    }
  };

  const orderStatuses: Order['status'][] = ['Pending', 'In-progress', 'Delivered', 'Cancelled'];

  return (
    <AppShell>
      <PageHeader title="Orders Management">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </PageHeader>
      <Tabs defaultValue="Pending">
        <div className="overflow-x-auto">
          <TabsList className="bg-transparent p-0 border-b-2 border-border h-auto rounded-none">
            {orderStatuses.map(status => (
              <TabsTrigger 
                key={status} 
                value={status}
                className={cn(
                  "data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none",
                  "text-base"
                )}
              >
                <span className="whitespace-nowrap">{status}</span>
                <Badge variant={statusVariant[status]} className="ml-2 px-1.5 py-0.5 text-xs">
                  {orders.filter(o => o.status === status).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {orderStatuses.map(status => (
          <TabsContent key={status} value={status}>
            <OrdersTable 
              orders={orders.filter(o => o.status === status)}
              onShowDetails={handleShowDetails}
              onAssignAgent={handleAssignAgent}
              onCancelOrder={handleCancelOrder}
            />
          </TabsContent>
        ))}
      </Tabs>
      
      {selectedOrder && <OrderDetailsDialog order={selectedOrder} isOpen={isDetailsOpen} onOpenChange={setIsDetailsOpen} />}
      {selectedOrder && <AssignAgentDialog order={selectedOrder} isOpen={isAssignOpen} onOpenChange={setIsAssignOpen} onAgentAssigned={handleAgentAssigned} agents={agents} />}
      
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will mark the order as cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelOrder} className="bg-destructive hover:bg-destructive/90">
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AppShell>
  );
}
