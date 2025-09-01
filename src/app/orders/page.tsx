
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
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
import { AuthContext } from '@/context/auth-context';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Delivered': 'default',
  'Pending': 'secondary',
  'In-progress': 'outline',
  'Cancelled': 'destructive',
  'Returned': 'destructive',
};

const orderStatuses: Order['status'][] = ['Pending', 'In-progress', 'Delivered', 'Cancelled', 'Returned'];

function OrdersTable({ 
  orders, 
  onShowDetails, 
  onAssignAgent, 
  onStatusChange,
  onReturn,
}: { 
  orders: Order[],
  onShowDetails: (order: Order) => void,
  onAssignAgent: (order: Order) => void,
  onStatusChange: (order: Order, status: Order['status']) => void,
  onReturn: (order: Order) => void;
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
                  <TableCell className="hidden lg:table-cell">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-32 justify-between" onClick={(e) => e.stopPropagation()}>
                                <Badge variant={statusVariant[order.status]} className="pointer-events-none">{order.status}</Badge>
                                <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuRadioGroup 
                                value={order.status} 
                                onValueChange={(newStatus) => onStatusChange(order, newStatus as Order['status'])}
                            >
                            {orderStatuses.filter(s => s !== 'Returned').map(status => (
                                <DropdownMenuRadioItem 
                                key={status} 
                                value={status}
                                disabled={
                                    (status === 'In-progress' && !order.assignedAgentId) || 
                                    (order.status === 'Delivered') ||
                                    (order.status === 'Cancelled' && status === 'Cancelled') ||
                                    (order.status === 'Returned')
                                }
                                >
                                {status}
                                {status === 'In-progress' && !order.assignedAgentId && " (Assign agent first)"}
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
                        {order.status === 'Pending' && (
                          <DropdownMenuItem onClick={() => onAssignAgent(order)}>Assign Agent</DropdownMenuItem>
                        )}
                        {order.status === 'Delivered' && (
                            <DropdownMenuItem onClick={() => onReturn(order)}>Return</DropdownMenuItem>
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
  const [isLoading, setIsLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useContext(AuthContext);

  const fetchOrders = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
           const parsedOrders = result.data.orders.map((o: any) => ({
              ...o,
              createdAt: new Date(o.createdAt),
          }));
          setOrders(parsedOrders);
          setFilteredOrders(parsedOrders);
        } else {
           toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to fetch orders.' });
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch orders.' });
    } finally {
        setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (!token) return;
     try {
       const response = await fetch(`${API_BASE_URL}/api/delivery-agents`, {
          headers: { 'Authorization': `Bearer ${token}` }
       });
       const result = await response.json();
       if(result.success) {
         setAgents(result.data.agents);
       } else {
         toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to fetch agents.' });
       }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch agents.' });
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchAgents();
    }
  }, [token]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm) ||
        (order.agentName && order.agentName.toLowerCase().includes(searchTerm))
    );
    setFilteredOrders(filtered);
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

  const handleReturnOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsReturnOpen(true);
  };

  const handleAgentAssigned = async (orderId: string, agentId: string) => {
    if (!token) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/assign-agent`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ agentId })
        });
        const result = await response.json();
        if (result.success) {
            toast({
              title: "Agent Assigned",
              description: `${result.data.order.agentName} has been assigned. Status updated to In-progress.`,
            });
            fetchOrders();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to assign agent.' });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to assign agent.' });
    }
  };

  const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
    if (order.status === newStatus) return;
    
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
      handleCancelOrder(order);
      return;
    }
    
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Order Status Updated',
          description: `Order #${order.id.slice(0,6)} has been marked as ${newStatus}.`
        });
        fetchOrders();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  }
  
  const confirmCancelOrder = async (reason: string) => {
    if (selectedOrder && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.id}/cancel`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cancellationReason: reason })
        });
        const result = await response.json();
        if(result.success) {
          toast({
            title: 'Order Cancelled',
            description: `Order #${selectedOrder.id.slice(0,6)} has been cancelled.`,
            variant: 'destructive'
          });
          fetchOrders();
          setIsCancelOpen(false);
          setSelectedOrder(null);
        } else {
           toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to cancel order.' });
        }
      } catch (error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Failed to cancel order.' });
      }
    }
  };

  const confirmReturnOrder = async (reason: string) => {
     if (selectedOrder && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.id}/return`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ returnReason: reason })
        });
        const result = await response.json();
        if(result.success) {
          toast({
            title: 'Order Returned',
            description: `Order #${selectedOrder.id.slice(0,6)} has been marked as returned.`,
            variant: 'destructive'
          });
          fetchOrders();
          setIsReturnOpen(false);
          setSelectedOrder(null);
        } else {
           toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to return order.' });
        }
      } catch (error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Failed to return order.' });
      }
    }
  };


  const getOrderCount = (status: Order['status']) => {
    return filteredOrders.filter(o => o.status === status).length;
  }
  
  const handleExport = () => {
    const csvHeader = "Order ID,Customer Name,Customer Phone,Agent Name,Agent Phone,Status,Total Amount,Date,Products\n";
    const csvRows = filteredOrders.map(o => {
        const productList = o.products.map(p => `${p.productName} (x${p.quantity})`).join('; ');
        const row = [
            o.id,
            `"${o.customerName}"`,
            o.customerPhone,
            `"${o.agentName || 'N/A'}"`,
            o.agentPhone || 'N/A',
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
                placeholder="Search by customer or agent..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                onChange={handleSearch}
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
                  <span className="whitespace-nowrap mr-2">{status}</span>
                  <Badge 
                     variant={statusVariant[status]} 
                     className={cn("px-2 py-0.5 text-xs font-semibold", {
                       'bg-primary/10 text-primary': status === 'In-progress',
                       'bg-green-100 text-green-800': status === 'Delivered',
                       'bg-red-100 text-red-800': status === 'Cancelled' || status === 'Returned',
                     })}
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
        {orderStatuses.map(status => (
          <TabsContent key={status} value={status} className="mt-4">
            <OrdersTable 
              orders={filteredOrders.filter(o => o.status === status)}
              onShowDetails={handleShowDetails}
              onAssignAgent={handleAssignAgent}
              onStatusChange={handleStatusChange}
              onReturn={handleReturnOrder}
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

    
