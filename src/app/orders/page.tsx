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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: Order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-primary">#{order.id.slice(0, 6)}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  {order.agentName ? (
                    <Badge variant="outline">{order.agentName}</Badge>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                <TableCell>
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
    getOrdersData().then(setOrders);
    getAgentsData().then(setAgents);
  }, []);

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

  const handleAgentAssigned = (orderId: string, agentId: string, agentName: string) => {
    setOrders(prevOrders => prevOrders.map(o => 
      o.id === orderId ? { ...o, assignedAgentId: agentId, agentName, status: 'In-progress' } : o
    ));
  };
  
  const confirmCancelOrder = () => {
    if (selectedOrder) {
      setOrders(prevOrders => prevOrders.map(o => 
        o.id === selectedOrder.id ? { ...o, status: 'Cancelled', reason: 'Cancelled by admin' } : o
      ));
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
        <TabsList>
          {orderStatuses.map(status => (
            <TabsTrigger key={status} value={status}>
              {status}
              <Badge variant={statusVariant[status]} className="ml-2 px-1.5 py-0.5 text-xs">
                {orders.filter(o => o.status === status).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
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
      
      <OrderDetailsDialog order={selectedOrder} isOpen={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
      <AssignAgentDialog order={selectedOrder} isOpen={isAssignOpen} onOpenChange={setIsAssignOpen} onAgentAssigned={handleAgentAssigned} />
      
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
