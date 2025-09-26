
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, FileDown, ChevronDown, Search, Loader2, Calendar as CalendarIcon, X } from 'lucide-react';
import type { Order, Agent } from '@/lib/types';
import { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import { AssignAgentDialog } from '@/components/assign-agent-dialog';
import { CancelOrderDialog } from '@/components/cancel-order-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ReturnOrderDialog } from '@/components/return-order-dialog';
import { Input } from '@/components/ui/input';
import { AuthContext, useAuth } from '@/context/auth-context';
import { useNotifications } from '@/context/notification-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProfileContext } from '@/context/profile-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

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

const orderStatusesForDropdown: Order['status'][] = ['pending', 'delivered', 'cancelled', 'returned'];
const orderStatusesForTabs: (Order['status'] | 'in-progress')[] = ['pending', 'confirmed', 'in-progress', 'out-for-delivery', 'delivered', 'cancelled', 'returned'];


function OrdersTable({ 
  orders,
  onShowDetails,
  onAssignAgent,
  onStatusChange,
  onReturn,
  onCancel,
  onConfirmAndAssign,
  updatingOrderId,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  isAdmin,
}: {
  orders: Order[],
  onShowDetails: (order: Order) => void,
  onAssignAgent: (order: Order) => void,
  onStatusChange: (order: Order, status: Order['status']) => void,
  onReturn: (order: Order) => void;
  onCancel: (order: Order) => void;
  onConfirmAndAssign: (order: Order) => void;
  updatingOrderId: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  isAdmin: boolean;
}) {

  const isActionDisabled = (status: Order['status']) => {
    return ['delivered', 'cancelled', 'returned'].includes(status);
  }
  
  const tableStatus = orders[0]?.status;


  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                {isAdmin && <TableHead className="hidden sm:table-cell">Agency</TableHead>}
                <TableHead>Delivery Mode</TableHead>
                <TableHead className="bg-green-200">Payment Method</TableHead>
                {tableStatus !== 'pending' && <TableHead className="hidden sm:table-cell">Agent</TableHead>}
                <TableHead className="hidden md:table-cell">Amount</TableHead>
                <TableHead className="hidden lg:table-cell">Order Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: Order) => (
                <TableRow
                  key={order.id}
                  onClick={() => onShowDetails(order)}
                  className={cn("cursor-pointer", {
                    "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30": order.deliveryMode === 'pickup'
                  })}
                >
                  <TableCell className="font-medium text-primary">#{order.orderNumber.slice(-8)}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                        <div key={index} className="text-xs">
                          <span className="font-semibold">{item.productName}</span>
                          <span> (quantity: {item.quantity})</span>
                          <div className="text-muted-foreground">{item.variantLabel}</div>
                           {index < order.items.length - 1 && <Separator className="my-1"/>}
                        </div>
                    ))}
                  </TableCell>
                   {isAdmin && (
                        <TableCell className="hidden sm:table-cell">
                            {order.agency ? (
                            <Badge variant="outline">{order.agency.name}</Badge>
                            ) : (
                            <span className="text-muted-foreground">N/A</span>
                            )}
                        </TableCell>
                    )}
                  <TableCell className="capitalize">
                    {order.deliveryMode?.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="capitalize bg-green-200">
                    {order.paymentMethod?.replace('_', ' ')}
                  </TableCell>
                   {tableStatus !== 'pending' && (
                        <TableCell className="hidden sm:table-cell">
                            {order.assignedAgent ? (
                            <Badge variant="outline">{order.assignedAgent.name}</Badge>
                            ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                            )}
                        </TableCell>
                    )}
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
                            {orderStatusesForDropdown.filter(s => !['assigned', 'out-for-delivery'].includes(s)).map(status => (
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
                    {order.status === 'cancelled' && order.cancelledBy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          by <span className="font-medium capitalize">{order.cancelledByName || order.cancelledBy}</span>
                        </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {order.status === 'pending' ? (
                       <div className="flex gap-2">
                            <Button size="sm" onClick={() => onConfirmAndAssign(order)} disabled={!!updatingOrderId}>
                              {updatingOrderId === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                              Confirm
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => onCancel(order)} disabled={!!updatingOrderId}>
                              Cancel
                            </Button>
                       </div>
                    ) : (
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
                            {(order.status === 'confirmed') && (
                            <DropdownMenuItem className="bg-green-500 text-white hover:!bg-green-600 hover:!text-white focus:!bg-green-600 focus:!text-white" onClick={() => onAssignAgent(order)}>Assign Agent</DropdownMenuItem>
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
                    )}
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
            Showing {orders.length} of {totalItems} orders.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
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

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useContext(ProfileContext);
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { socket, removeNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();


  const fetchOrders = useCallback(async (page = 1, status = activeTab, search = searchTerm, start?: Date, end?: Date) => {
      if (!token) return;
      setIsLoading(true);
      try {
          const url = new URL(`${API_BASE_URL}/api/orders`);
          url.searchParams.append('page', String(page));
          url.searchParams.append('limit', String(ITEMS_PER_PAGE));
          if (status && status !== 'all') {
            const statusParam = status === 'in-progress' ? 'assigned' : status === 'out-for-delivery' ? 'out_for_delivery' : status;
            url.searchParams.append('status', statusParam);
          }
          if (search) {
              url.searchParams.append('search', search);
          }
          if (start) {
            url.searchParams.append('startDate', format(start, 'yyyy-MM-dd'));
          }
          if (end) {
              url.searchParams.append('endDate', format(end, 'yyyy-MM-dd'));
          }

          const response = await fetch(url.toString(), {
              headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
          });
          if (!response.ok) handleApiError(response);
          const result = await response.json();
          if (result.success) {
              setOrders(result.data.orders);
              setPagination(result.data.pagination);
          } else {
              toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch orders.' });
          }
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch orders.' });
      } finally {
          setIsLoading(false);
      }
  }, [token, toast, handleApiError, activeTab, searchTerm]);

  const fetchStatusCounts = useCallback(async (start?: Date, end?: Date) => {
    if (!token) return;
    const counts: Record<string, number> = {};
    const params = new URLSearchParams();
    params.append('limit', '1');
     if (start) {
        params.append('startDate', format(start, 'yyyy-MM-dd'));
      }
      if (end) {
          params.append('endDate', format(end, 'yyyy-MM-dd'));
      }
    
    for (const status of orderStatusesForTabs) {
      try {
        const statusParam = status === 'in-progress' ? 'assigned' : status === 'out-for-delivery' ? 'out_for_delivery' : status;
        const url = `${API_BASE_URL}/api/orders?status=${statusParam}&${params.toString()}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            counts[status] = result.data.pagination.totalItems;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch count for ${status}`, error);
      }
    }
    setStatusCounts(counts);
  }, [token]);

  useEffect(() => {
    fetchOrders(1, activeTab, searchTerm, startDate, endDate);
    fetchStatusCounts(startDate, endDate);
  }, [activeTab, searchTerm, startDate, endDate, fetchOrders, fetchStatusCounts]);

  const handlePageChange = (newPage: number) => {
      fetchOrders(newPage, activeTab, searchTerm, startDate, endDate);
  }

  useEffect(() => {
    if (socket) {
        const handleNewOrder = () => {
            fetchOrders(1, activeTab, searchTerm, startDate, endDate); 
            fetchStatusCounts(startDate, endDate);
        };
        socket.on('newOrder', handleNewOrder);

        return () => {
            socket.off('newOrder', handleNewOrder);
        };
    }
  }, [socket, fetchOrders, fetchStatusCounts, activeTab, searchTerm, startDate, endDate]);

  const fetchAgents = useCallback(async () => {
     if (!token) return;
     try {
       const response = await fetch(`${API_BASE_URL}/api/delivery-agents`, {
            headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
            setAgents(result.data.agents);
        }
    } catch (error) {
       console.error("Failed to load agents", error);
    }
  }, [token, handleApiError]);

  useEffect(() => {
    fetchAgents();
  }, [token, fetchAgents]);
  
  useEffect(() => {
    const assignAgentOrderId = searchParams.get('assignAgent');
    if (assignAgentOrderId) {
      const orderToAssign = orders.find(o => o.id === assignAgentOrderId) || { id: assignAgentOrderId } as Order; 
      handleAssignAgent(orderToAssign);
      router.replace('/orders', { scroll: false });
    }
  }, [searchParams, orders, router]);

  const handleShowDetails = (order: Order) => {
    router.push(`/orders/${order.id}`);
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
      // 1. Assign the agent
      const assignResponse = await fetch(`${API_BASE_URL}/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ agentId })
      });

      if (!assignResponse.ok) {
        const result = await assignResponse.json();
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to assign agent.' });
        return;
      }
      
      const assignResult = await assignResponse.json();
      if(assignResult.success) {
        toast({
          title: "Agent Assigned",
          description: `Agent has been assigned to the order.`,
        });

        // 2. Update the status
        await updateOrderStatus(assignResult.data.order, 'assigned', 'Agent assigned');
      } else {
        toast({ variant: 'destructive', title: 'Error', description: assignResult.error || 'Failed to assign agent.' });
      }

    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to assign agent.' });
    }
  };


  const onUpdate = () => {
    fetchOrders(pagination.currentPage, activeTab, searchTerm, startDate, endDate);
    fetchStatusCounts(startDate, endDate);
  }

  const updateOrderStatus = async (order: Order, newStatus: Order['status'], notes?: string): Promise<boolean> => {
    if (!token) return false;
    setUpdatingOrderId(order.id);

    const requestBody: { status: Order['status'], adminNotes?: string } = { status: newStatus };
    if (notes) {
      requestBody.adminNotes = notes;
    }

    try {
       const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        handleApiError(response);
        setUpdatingOrderId(null);
        return false;
      };
      const result = await response.json();
       if (result.success) {
        toast({
          title: 'Order Status Updated',
          description: `Order #${order.orderNumber?.slice(-8)} has been marked as ${newStatus}.`
        });
        if(newStatus === 'confirmed') {
            removeNotification(order.id);
        }
        onUpdate();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
        return false;
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
      return false;
    } finally {
      setUpdatingOrderId(null);
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
  
 const handleConfirmAndAssign = async (order: Order) => {
    if (order.deliveryMode === 'pickup') {
      await updateOrderStatus(order, 'confirmed', 'Order confirmed for pickup');
    } else {
      // For home delivery, just open the assign dialog without changing status
      handleAssignAgent(order);
    }
  };

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
  
  const handleExport = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/export`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      const blob = await response.blob();
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', 'orders_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to export orders.' });
    }
  }

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  }

  return (
    <AppShell
      onConfirmAndAssignFromNotification={handleConfirmAndAssign}
      orders={orders}
    >
      <PageHeader title="Orders Management">
        <div className="flex items-center gap-2">
           <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by customer, agent or ID..."
                className="pl-8 sm:w-[300px]"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Start date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    />
                </PopoverContent>
            </Popover>
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>End date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    />
                </PopoverContent>
            </Popover>
             {(startDate || endDate) && (
              <Button variant="ghost" size="icon" onClick={clearDateFilter}>
                <X className="h-4 w-4" />
                <span className="sr-only">Clear date filter</span>
              </Button>
            )}
          <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExport}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </PageHeader>
      {isLoading && orders.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
      <Tabs defaultValue="pending" onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="bg-muted p-1 rounded-lg">
            {orderStatusesForTabs.map(status => (
              <TabsTrigger 
                key={status} 
                value={status}
                className="capitalize px-4 py-1.5 text-sm font-medium rounded-md"
              >
                <span className="mr-2">{status.replace('_', '-')}</span>
                 <Badge variant={status === activeTab ? 'default' : 'secondary'}>
                    {statusCounts[status] ?? 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
          <TabsContent value={activeTab} className="mt-4">
            <OrdersTable 
              orders={orders}
              onShowDetails={handleShowDetails}
              onAssignAgent={handleAssignAgent}
              onStatusChange={handleStatusChange}
              onReturn={handleReturnOrder}
              onCancel={handleCancelOrder}
              onConfirmAndAssign={handleConfirmAndAssign}
              updatingOrderId={updatingOrderId}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalItems={pagination.totalItems}
              isAdmin={isAdmin}
            />
          </TabsContent>
      </Tabs>
      )}
      
      {selectedOrder && <AssignAgentDialog order={selectedOrder} isOpen={isAssignOpen} onOpenChange={setIsAssignOpen} onAgentAssigned={handleAgentAssigned} agents={agents} />}
      {selectedOrder && <CancelOrderDialog order={selectedOrder} isOpen={isCancelOpen} onOpenChange={setIsCancelOpen} onConfirm={confirmCancelOrder} />}
      {selectedOrder && <ReturnOrderDialog order={selectedOrder} isOpen={isReturnOpen} onOpenChange={setIsReturnOpen} onConfirm={confirmReturnOrder} />}

    </AppShell>
  );
}

export default function OrdersPage() {
    return (
        <OrdersPageContent />
    );
}

    