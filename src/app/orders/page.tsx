import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, FileDown } from 'lucide-react';
import { getOrdersData } from '@/lib/data';
import type { Order } from '@/lib/types';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Delivered': 'default',
  'Pending': 'secondary',
  'In-progress': 'outline',
  'Cancelled': 'destructive',
};

function OrdersTable({ orders }: { orders: Order[] }) {
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
                <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
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
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Assign Agent</DropdownMenuItem>
                      <DropdownMenuItem>Cancel Order</DropdownMenuItem>
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

export default async function OrdersPage() {
  const orders = await getOrdersData();
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
            <OrdersTable orders={orders.filter(o => o.status === status)} />
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}
