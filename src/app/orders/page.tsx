
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, FileDown, ChevronDown, Search, Loader2 } from 'lucide-react';
import type { Order, Agent } from '@/lib/types';
import { useEffect, useState, useMemo, useContext } from 'react';
import { OrderDetailsDialog } from '@/components/order-details-dialog';
import { AssignAgentDialog } from '@/components/assign-agent-dialog';
import { CancelOrderDialog } from '@/components/cancel-order-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ReturnOrderDialog } from '@/components/return-order-dialog';
import { Input } from '@/components/ui/input';
import { AuthContext, useAuth } from '@/context/auth-context';
import { useNotifications } from '@/context/notification-context';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'delivered': 'default',
  'pending': 'secondary',
  'confirmed': 'secondary',
  'assigned': 'outline',
  'in-progress': 'outline',
  'out-for-delivery': 'outline',
  'cancelled': 'destructive',
  'returned': 'destructive',
};

const orderStatusesForDropdown: Order['status'][] = ['pending', 'confirmed', 'assigned', 'out-for-delivery', 'delivered', 'cancelled', 'returned'];
const orderStatusesForTabs: (Order['status'] | 'in-progress')[] = ['pending', 'confirmed', 'in-progress', 'out-for-delivery', 'delivered', 'cancelled', 'returned'];


function OrdersTable({ 
  orders, 
  onShowDetails, 
  onAssignAgent, 
  onStatusChange,
  onReturn,
  onCancel,
}: { 
  orders: Order[],
  onShowDetails: (order: Order) => void,
  onAssignAgent: (order: Order) => void,
  onStatusChange: (order: Order, status: Order['status']) => void,
  onReturn: (order: Order) => void;
  onCancel: (order: Order) => void;
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

  const isActionDisabled = (status: Order['status']) => {
    return ['delivered', 'cancelled', 'returned'].includes(status);
  }

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
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order: Order) => (
                <TableRow key={order.id} onClick={() => onShowDetails(order)} className="cursor-pointer">
                  <TableCell className="font-medium text-primary">#{order.orderNumber.slice(-8)}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.assignedAgent ? (
                      <Badge variant="outline">{order.assignedAgent.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-40 justify-between capitalize" onClick={(e) => e.stopPropagation()}>
                                <Badge variant={statusVariant[order.status]} className="pointer-events-none">{order.status.replace('_', ' ')}</Badge>
                                <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuRadioGroup 
                                value={order.status} 
                                onValueChange={(newStatus) => onStatusChange(order, newStatus as Order['status'])}
                            >
                            {orderStatusesForDropdown.filter(s => s !== 'returned').map(status => (
                                <DropdownMenuRadioItem 
                                key={status} 
                                value={status}
                                disabled={
                                    (status === 'in-progress' && !order.assignedAgent) || 
                                    isActionDisabled(order.status)
                                }
                                className="capitalize"
                                >
                                {status.replace('_', ' ')}
                                {status === 'in-progress' && !order.assignedAgent && " (Assign agent first)"}
                                </DropdownMenuRadioItem>
                            ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
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
                        {order.status === 'pending' && (
                           <DropdownMenuItem onClick={() => onStatusChange(order, 'confirmed')}>Confirm Order</DropdownMenuItem>
                        )}
                        {(order.status === 'confirmed') && (
                          <DropdownMenuItem onClick={() => onAssignAgent(order)}>Assign Agent</DropdownMenuItem>
                        )}
                        {order.status === 'delivered' && (
                            <DropdownMenuItem onClick={() => onReturn(order)}>Return</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => onCancel(order)} 
                            className="text-destructive"
                            disabled={isActionDisabled(order.status)}
                        >
                            Cancel Order
                        </DropdownMenuItem>
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
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useContext(AuthContext);
  const { handleApiError } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { socket } = useNotifications();


  const fetchOrders = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
          const response = await fetch(`${API_BASE_URL}/api/orders`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) handleApiError(response);
          const result = await response.json();
          if (result.success) {
              setOrders(result.data.orders);
          } else {
              toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch orders.' });
          }
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch orders.' });
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (socket) {
        socket.on('newOrder', (newOrder) => {
            console.log('New order received via socket:', newOrder);
            toast({
                title: "New Order Received!",
                description: `Order #${newOrder.orderNumber.slice(-8)} from ${newOrder.customerName}.`
            });
            fetchOrders(); // Refetch orders when a new one comes in
        });

        return () => {
            socket.off('newOrder');
        };
    }
}, [socket, toast]);

  const fetchAgents = async () => {
     if (!token) return;
     try {
       const response = await fetch(`${API_BASE_URL}/api/delivery-agents`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
            setAgents(result.data.agents);
        }
    } catch (error) {
       console.error("Failed to load agents", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, [token]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.assignedAgent && order.assignedAgent.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);


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

  const handleReturnOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsReturnOpen(true);
  };

  const handleAgentAssigned = async (orderId: string, agentId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ agentId })
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Agent Assigned",
          description: `Agent has been assigned and status updated.`,
        });
        fetchOrders();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to assign agent.' });
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to assign agent.' });
    }
  };

  const updateOrderStatus = async (order: Order, newStatus: Order['status'], notes?: string) => {
    if (!token) return;

    const requestBody: { status: Order['status'], adminNotes?: string } = { status: newStatus };
    if (notes) {
      requestBody.adminNotes = notes;
    }

    try {
       const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
       if (result.success) {
        toast({
          title: 'Order Status Updated',
          description: `Order #${order.orderNumber.slice(-8)} has been marked as ${newStatus}.`
        });
        fetchOrders();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  }


  const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
    if (order.status === newStatus) return;
    
    if (newStatus === 'cancelled') {
      handleCancelOrder(order);
      return;
    }
    
    let notes;
    if (newStatus === 'confirmed') {
        notes = 'Order confirmed and ready for delivery';
    }

    await updateOrderStatus(order, newStatus, notes);
  }
  
  const confirmCancelOrder = async (reason: string) => {
    if (selectedOrder) {
       await updateOrderStatus(selectedOrder, 'cancelled', reason);
       setIsCancelOpen(false);
       setSelectedOrder(null);
    }
  };

  const confirmReturnOrder = async (reason: string) => {
     if (selectedOrder) {
       await updateOrderStatus(selectedOrder, 'returned', reason);
       setIsReturnOpen(false);
       setSelectedOrder(null);
    }
  };

  const getOrderCount = (status: string) => {
    if (status === 'in-progress') {
      return filteredOrders.filter(o => ['assigned', 'in-progress'].includes(o.status)).length;
    }
    return filteredOrders.filter(o => o.status === status).length;
  }
  
  const handleExport = () => {
    const csvHeader = "Order ID,Customer Name,Customer Phone,Agent Name,Agent Phone,Status,Total Amount,Date,Products\n";
    const csvRows = filteredOrders.map(o => {
        const productList = o.items.map(p => `${p.productName} ${p.variantLabel} (x${p.quantity})`).join('; ');
        const row = [
            o.orderNumber,
            `"${o.customerName}"`,
            o.customerPhone,
            `"${o.assignedAgent?.name || 'N/A'}"`,
            o.assignedAgent?.phone || 'N/A',
            o.status,
            o.totalAmount,
            new Date(o.createdAt).toISOString(),
            `"${productList}"`
        ].join(',');
        return row;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'orders_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  return (
    <AppShell>
      <PageHeader title="Orders Management">
        <div className="flex items-center gap-2">
           <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by customer, agent or ID..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExport}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </PageHeader>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
      <Tabs defaultValue="pending">
        <div className="overflow-x-auto">
          <TabsList className="bg-transparent p-0 border-b h-auto rounded-none">
            {orderStatusesForTabs.map(status => {
              const count = getOrderCount(status);
              return (
                <TabsTrigger 
                  key={status} 
                  value={status}
                  className={cn(
                    "data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none capitalize",
                    "text-base px-4"
                  )}
                >
                  <span className="whitespace-nowrap mr-2">{status.replace('_', ' ')}</span>
                  <Badge 
                     variant={statusVariant[status]} 
                     className={cn("px-2 py-0.5 text-xs font-semibold", {
                       'bg-primary/10 text-primary': status === 'in-progress' || status === 'assigned' || status === 'out-for-delivery',
                       'bg-green-100 text-green-800': status === 'delivered',
                       'bg-red-100 text-red-800': status === 'cancelled' || status === 'returned',
                     })}
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
        {orderStatusesForTabs.map(status => (
          <TabsContent key={status} value={status} className="mt-4">
            <OrdersTable 
              orders={filteredOrders.filter(o => {
                if (status === 'in-progress') {
                  return ['assigned', 'in-progress'].includes(o.status);
                }
                return o.status === status;
              })}
              onShowDetails={handleShowDetails}
              onAssignAgent={handleAssignAgent}
              onStatusChange={handleStatusChange}
              onReturn={handleReturnOrder}
              onCancel={handleCancelOrder}
            />
          </TabsContent>
        ))}
      </Tabs>
      )}
      
      {selectedOrder && <OrderDetailsDialog order={selectedOrder} isOpen={isDetailsOpen} onOpenChange={setIsDetailsOpen} />}
      {selectedOrder && <AssignAgentDialog order={selectedOrder} isOpen={isAssignOpen} onOpenChange={setIsAssignOpen} onAgentAssigned={handleAgentAssigned} agents={agents} />}
      {selectedOrder && <CancelOrderDialog order={selectedOrder} isOpen={isCancelOpen} onOpenChange={setIsCancelOpen} onConfirm={confirmCancelOrder} />}
      {selectedOrder && <ReturnOrderDialog order={selectedOrder} isOpen={isReturnOpen} onOpenChange={setIsReturnOpen} onConfirm={confirmReturnOrder} />}

    </AppShell>
  );
}
