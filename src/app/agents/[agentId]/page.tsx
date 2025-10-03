"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Truck, 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { AuthContext, useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AgentDetailsResponse {
  success: boolean;
  message: string;
  data: {
    agent: {
      id: string;
      name: string;
      email: string;
      phone: string;
      vehicleNumber: string;
      panCardNumber: string;
      aadharCardNumber: string;
      drivingLicence: string;
      bankDetails: string;
      status: string;
      joinedAt: string;
      profileImage: string;
      agencyId: string;
      createdAt: string;
      updatedAt: string;
      agency: {
        id: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        status: string;
      };
    };
    statistics: {
      totalOrders: number;
      deliveredOrders: number;
      pendingOrders: number;
      cancelledOrders: number;
      totalEarnings: number;
      uniqueCustomersServed: number;
      statusDistribution: {
        assigned: number;
        out_for_delivery: number;
        delivered: number;
      };
    };
    recentDeliveries: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      totalAmount: string;
      deliveredAt: string;
      deliveryProofImage: string | null;
      deliveryNote: string | null;
      paymentReceived: boolean;
      agency: {
        id: string;
        name: string;
        city: string;
      };
    }>;
    monthlyPerformance: Array<{
      month: string;
      deliveries: number;
      earnings: number;
    }>;
    allOrders: Array<{
      id: string;
      orderNumber: string;
      status: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      customerAddress: string;
      totalAmount: string;
      paymentMethod: string;
      paymentStatus: string;
      deliveryMode: string;
      items: Array<{
        total: number;
        quantity: number;
        productId: string;
        productName: string;
        variantLabel: string;
        variantPrice: number;
      }>;
      createdAt: string;
      confirmedAt: string | null;
      assignedAt: string | null;
      outForDeliveryAt: string | null;
      deliveredAt: string | null;
      cancelledAt: string | null;
      cancelledBy: string | null;
      cancelledByName: string | null;
      returnedAt: string | null;
      returnedBy: string | null;
      returnedByName: string | null;
      returnReason: string | null;
      adminNotes: string | null;
      agentNotes: string | null;
      deliveryProofImage: string | null;
      deliveryNote: string | null;
      paymentReceived: boolean;
      agency: {
        id: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
      };
    }>;
  };
}

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'delivered': 'default',
  'pending': 'secondary',
  'confirmed': 'secondary',
  'assigned': 'outline',
  'out_for_delivery': 'outline',
  'cancelled': 'destructive',
  'returned': 'destructive',
};

function OrderDetailsDialog({ order, children }: { order: any; children: React.ReactNode }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'assigned': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'out_for_delivery': return <Truck className="h-4 w-4 text-orange-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusIcon = (received: boolean) => {
    return received ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <Clock className="h-4 w-4 text-orange-500" />;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <span>Order Details - #{order.orderNumber.slice(-8)}</span>
            <Badge variant={statusVariant[order.status] || 'secondary'}>
              {order.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Order Number</p>
                  <p className="font-mono">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-lg">₹{parseFloat(order.totalAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Payment Method</p>
                  <p className="capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Payment Status</p>
                  <div className="flex items-center space-x-2">
                    {getPaymentStatusIcon(order.paymentReceived)}
                    <span className="capitalize">{order.paymentStatus}</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Delivery Mode</p>
                  <p className="capitalize">{order.deliveryMode?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Created At</p>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-2">Delivery Address</p>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{order.customerAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customerEmail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${order.customerPhone}`} className="hover:underline">{order.customerPhone}</a>
                </div>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-muted-foreground mb-2">Agency</p>
                <div className="bg-muted p-3 rounded-lg">
                  <h5 className="font-semibold">{order.agency.name}</h5>
                  <div className="space-y-1 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>{order.agency.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3" />
                      <span>{order.agency.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3" />
                      <span>{order.agency.address}, {order.agency.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-semibold">{item.productName}</h5>
                      <p className="text-sm text-muted-foreground">Variant: {item.variantLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.variantPrice.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium">Total: ₹{item.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {order.confirmedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.confirmedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {order.assignedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Agent Assigned</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.assignedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {order.outForDeliveryAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Out for Delivery</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.outForDeliveryAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.deliveredAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {order.cancelledAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Cancelled</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.cancelledAt).toLocaleString()}
                        {order.cancelledByName && ` by ${order.cancelledByName}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {(order.adminNotes || order.agentNotes) && (
                <div className="mt-6 space-y-3">
                  {order.adminNotes && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Admin Notes</p>
                      <p className="text-sm bg-muted p-2 rounded">{order.adminNotes}</p>
                    </div>
                  )}
                  {order.agentNotes && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Agent Notes</p>
                      <p className="text-sm bg-muted p-2 rounded">{order.agentNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AgentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;
  const { token, handleApiError } = useAuth();
  const { toast } = useToast();

  const [agentData, setAgentData] = useState<AgentDetailsResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchAgentDetails = useCallback(async () => {
    if (!token || !agentId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/delivery-agents/${agentId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'ngrok-skip-browser-warning': 'true' 
        }
      });
      
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      
      const result: AgentDetailsResponse = await response.json();
      
      if (result.success) {
        setAgentData(result.data);
      } else {
        setError(result.message || 'Failed to fetch agent details.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, token, handleApiError]);

  useEffect(() => {
    fetchAgentDetails();
  }, [fetchAgentDetails]);

  // Pagination logic - always called to maintain hook order
  const totalPages = agentData ? Math.ceil(agentData.allOrders.length / ITEMS_PER_PAGE) : 0;
  const paginatedOrders = useMemo(() => {
    if (!agentData) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return agentData.allOrders.slice(startIndex, endIndex);
  }, [agentData, currentPage]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error || !agentData) {
    return (
      <AppShell>
        <PageHeader title="Agent Details">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </PageHeader>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive">{error || 'Agent not found'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const { agent, statistics, recentDeliveries, monthlyPerformance, allOrders } = agentData;

  return (
    <AppShell>
      <PageHeader title="Agent Details">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agents
        </Button>
      </PageHeader>

      {/* Agent Profile Card */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={agent.profileImage || undefined} />
              <AvatarFallback className="text-lg">
                {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold">{agent.name || 'Unknown Agent'}</h2>
                <Badge variant={agent.status === 'online' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{agent.email || 'No email'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${agent.phone}`} className="hover:underline">{agent.phone || 'No phone'}</a>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(agent.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{statistics.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{statistics.deliveredOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{statistics.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">₹{statistics.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Orders and Details */}
      <Tabs defaultValue="orders" className="space-y-2">
        <TabsList>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="deliveries">Recent Deliveries</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="details">Agent Details</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {paginatedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Available</h3>
                  <p className="text-muted-foreground">
                    This agent hasn't been assigned any orders yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Delivery Mode</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Assigned At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.orderNumber.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[order.status] || 'secondary'}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                          <TableCell className="capitalize">
                            {order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'Not specified'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.paymentReceived ? 'default' : 'secondary'}>
                              {order.paymentReceived ? 'Paid' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {order.deliveryMode ? order.deliveryMode.replace('_', ' ') : 'Not specified'}
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {order.assignedAt ? new Date(order.assignedAt).toLocaleDateString() : 'Not assigned'}
                          </TableCell>
                          <TableCell>
                            <OrderDetailsDialog order={order}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </OrderDetailsDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {paginatedOrders.length} of {allOrders.length} orders.
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
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="deliveries">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {recentDeliveries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Deliveries Yet</h3>
                  <p className="text-muted-foreground">
                    This agent hasn't completed any deliveries yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDeliveries.map((delivery) => (
                    <Card key={delivery.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">#{delivery.orderNumber.slice(-8)}</h4>
                            <p className="text-sm text-muted-foreground">{delivery.customerName}</p>
                            <p className="text-sm font-medium">₹{parseFloat(delivery.totalAmount).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(delivery.deliveredAt).toLocaleDateString()}
                            </p>
                            <Badge variant={delivery.paymentReceived ? 'default' : 'secondary'}>
                              {delivery.paymentReceived ? 'Paid' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        {delivery.deliveryProofImage && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Delivery Proof</p>
                            <img 
                              src={delivery.deliveryProofImage} 
                              alt="Delivery proof" 
                              className="h-20 w-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        {delivery.deliveryNote && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Delivery Note</p>
                            <p className="text-sm bg-muted p-2 rounded">{delivery.deliveryNote}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyPerformance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
                  <p className="text-muted-foreground">
                    No performance data available for this agent yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {monthlyPerformance.map((month, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{month.month}</h4>
                            <p className="text-sm text-muted-foreground">{month.deliveries} deliveries</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">₹{month.earnings.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Information */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>Vehicle: {agent.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>PAN: {agent.panCardNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Aadhar: {agent.aadharCardNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>License: {agent.drivingLicence}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-muted-foreground mb-2">Bank Details</p>
                  <p className="text-sm bg-muted p-2 rounded">{agent.bankDetails}</p>
                </div>
              </CardContent>
            </Card>

            {/* Agency Information */}
            <Card>
              <CardHeader>
                <CardTitle>Agency Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-semibold">{agent.agency.name}</h5>
                  <div className="space-y-2 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>{agent.agency.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3" />
                      <span>{agent.agency.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3" />
                      <span>{agent.agency.address}, {agent.agency.city}</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-muted-foreground mb-2">Status Distribution</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Assigned</span>
                      <span className="font-medium">{statistics.statusDistribution.assigned}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Out for Delivery</span>
                      <span className="font-medium">{statistics.statusDistribution.out_for_delivery}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivered</span>
                      <span className="font-medium">{statistics.statusDistribution.delivered}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
