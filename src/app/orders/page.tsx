
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, FileDown, Truck, CheckCircle, Ban } from 'lucide-react';
import { getOrdersData, getAgentsData } from '@/lib/data';
import type { Order, Agent } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
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
const AGENTS_STORAGE_KEY = 'gastrack-agents';
const ITEMS_PER_PAGE = 10;

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Delivered': 'default',
  'Pending': 'secondary',
  'In-progress': 'outline',
  'Cancelled': 'destructive',
};

const orderStatuses: Order['status'][] = ['Pending', 'In-progress', 'Delivered', 'Cancelled'];

function OrdersTable({ 
  orders, 
  onShowDetails, 
  onAssignAgent, 
  onCancelOrder,
  onStatusChange,
}: { 
  orders: Order[],
  onShowDetails: (order: Order) => void,
  onAssignAgent: (order: Order) => void,
  onCancelOrder: (order: Order) => void,
  onStatusChange: (order: Order, status: Order['status']) => void,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return orders.slice(startIndex, endIndex);
  }, [orders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [orders]);

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
              {paginatedOrders.map((order: Order) => (
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
                         <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger disabled={order.status === 'Delivered'}>
                              <span>Change Status</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                               <DropdownMenuRadioGroup value={order.status} onValueChange={(newStatus) => onStatusChange(order, newStatus as Order['status'])}>
                                {orderStatuses.map(status => (
                                  <DropdownMenuRadioItem 
                                    key={status} 
                                    value={status}
                                    disabled={
                                        // Disable "In-progress" if no agent is assigned
                                        (status === 'In-progress' && !order.assignedAgentId) || 
                                        // Disable changing status if order is already delivered
                                        (order.status === 'Delivered') ||
                                        // Also disable if the order is cancelled, unless we are un-cancelling it
                                        (order.status === 'Cancelled' && status !== 'Pending' && status !== 'In-progress' && status !== 'Delivered')
                                    }
                                  >
                                    {status}
                                    {status === 'In-progress' && !order.assignedAgentId && " (Assign agent first)"}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                         {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                           <DropdownMenuItem onClick={() => onCancelOrder(order)} className="text-destructive focus:text-destructive">
                             <Ban className="mr-2 h-4 w-4" />
                             <span>Cancel Order</span>
                           </DropdownMenuItem>
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
       {totalPages > 1 && (
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedOrders.length} of {orders.length} orders.
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
       try {
        const savedAgents = window.localStorage.getItem(AGENTS_STORAGE_KEY);
        if (savedAgents) {
          const parsedAgents = JSON.parse(savedAgents).map((a: any) => ({
            ...a,
            createdAt: new Date(a.createdAt),
          }));
          setAgents(parsedAgents);
        } else {
          const data = await getAgentsData();
          setAgents(data);
          window.localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to load agents from localStorage", error);
        const data = await getAgentsData();
        setAgents(data);
      }
    };
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
          description: `${agent.name} has been assigned to order #${orderId.slice(0, 6)}. Status updated to In-progress.`,
        });
    }
  };

  const handleStatusChange = (order: Order, newStatus: Order['status']) => {
    if (order.status === newStatus) return;
    
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
      handleCancelOrder(order);
      return;
    }

    const newOrders = orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o);
    updateOrdersStateAndStorage(newOrders);
    toast({
      title: 'Order Status Updated',
      description: `Order #${order.id.slice(0,6)} has been marked as ${newStatus}.`
    });
  }
  
  const confirmCancelOrder = () => {
    if (selectedOrder) {
      const newOrders = orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'Cancelled' as const } : o);
      updateOrdersStateAndStorage(newOrders);
      toast({
        title: 'Order Cancelled',
        description: `Order #${selectedOrder.id.slice(0,6)} has been cancelled.`,
        variant: 'destructive'
      });
      setIsCancelOpen(false);
      setSelectedOrder(null);
    }
  };

  const getOrderCount = (status: Order['status']) => {
    return orders.filter(o => o.status === status).length;
  }

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
          <TabsList className="bg-transparent p-0 border-b h-auto rounded-none">
            {orderStatuses.map(status => {
              const count = getOrderCount(status);
              return (
                <TabsTrigger 
                  key={status} 
                  value={status}
                  className={cn(
                    "data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none",
                    "text-base px-4"
                  )}
                >
                  <span className="whitespace-nowrap">{status}</span>
                  <Badge 
                     variant={statusVariant[status]} 
                     className={cn("ml-2 px-2 py-0.5 text-xs font-semibold", {
                       'bg-primary/10 text-primary': status === 'In-progress',
                       'bg-green-100 text-green-800': status === 'Delivered',
                       'bg-red-100 text-red-800': status === 'Cancelled'
                     })}
                  >
                    {count > 9 ? '9+' : count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
        {orderStatuses.map(status => (
          <TabsContent key={status} value={status} className="mt-4">
            <OrdersTable 
              orders={orders.filter(o => o.status === status)}
              onShowDetails={handleShowDetails}
              onAssignAgent={handleAssignAgent}
              onCancelOrder={handleCancelOrder}
              onStatusChange={handleStatusChange}
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
