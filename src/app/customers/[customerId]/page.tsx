"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Phone, Mail, MapPin, Calendar, Package, Truck, DollarSign, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profileImage: string | null;
  address: string | null;
  addresses: Array<{
    id: string;
    city: string;
    title: string;
    address: string;
    pincode: string;
    landmark: string;
  }>;
  isProfileComplete: boolean;
  registeredAt: string | null;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  statusDistribution: {
    assigned: number;
    pending: number;
    cancelled: number;
    out_for_delivery: number;
  };
}

interface DeliveryAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleNumber: string;
  status: string;
  profileImage: string;
  joinedAt: string;
  agency: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  paymentMethod?: string;
  paymentStatus?: string;
  deliveryMode?: string;
  customerAddress: string | null;
  items: Array<{
    total: number;
    quantity: number;
    productId: string;
    productName: string;
    variantLabel: string;
    variantPrice: number;
  }>;
  createdAt: string;
  confirmedAt?: string | null;
  assignedAt?: string | null;
  outForDeliveryAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancelledByName?: string | null;
  returnedAt?: string | null;
  returnedBy?: string | null;
  returnedByName?: string | null;
  returnReason?: string | null;
  adminNotes?: string | null;
  agentNotes?: string | null;
  deliveryProofImage?: string | null;
  deliveryNote?: string | null;
  paymentReceived?: boolean;
  deliveryAgent?: DeliveryAgent | null;
  agency?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
}

interface CustomerDetailsResponse {
  success: boolean;
  message: string;
  data: {
    customer: CustomerDetails;
    statistics: Statistics;
    deliveryAgents: DeliveryAgent[];
    recentOrders: Order[];
    allOrders: Order[];
  };
}

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'delivered': 'default',
  'pending': 'secondary',
  'confirmed': 'secondary',
  'assigned': 'outline',
  'out-for-delivery': 'outline',
  'cancelled': 'destructive',
  'returned': 'destructive',
};

// Order Details Dialog Component
function OrderDetailsDialog({ order, children }: { order: Order; children: React.ReactNode }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Package className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPaymentStatusIcon = (received: boolean) => {
    return received ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
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
          {/* Order Information */}
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

              {order.customerAddress && (
                <div>
                  <p className="font-medium text-muted-foreground mb-2">Delivery Address</p>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{order.customerAddress}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Agent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Agent</CardTitle>
            </CardHeader>
            <CardContent>
              {order.deliveryAgent ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={order.deliveryAgent.profileImage} />
                      <AvatarFallback>{order.deliveryAgent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{order.deliveryAgent.name}</h4>
                      <Badge variant={order.deliveryAgent.status === 'online' ? 'default' : 'secondary'}>
                        {order.deliveryAgent.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{order.deliveryAgent.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${order.deliveryAgent.phone}`} className="hover:underline">
                        {order.deliveryAgent.phone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>{order.deliveryAgent.vehicleNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {new Date(order.deliveryAgent.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">Agency</p>
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-semibold">{order.deliveryAgent.agency.name}</h5>
                      <div className="space-y-1 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3" />
                          <span>{order.deliveryAgent.agency.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span>{order.deliveryAgent.agency.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>{order.deliveryAgent.agency.address}, {order.deliveryAgent.agency.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No delivery agent assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
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

          {/* Order Timeline */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.confirmedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.confirmedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {order.assignedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Agent Assigned</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.assignedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {order.outForDeliveryAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Out for Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.outForDeliveryAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {order.deliveredAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.deliveredAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {order.cancelledAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Cancelled</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.cancelledAt).toLocaleString()}
                        {order.cancelledBy && ` by ${order.cancelledByName || order.cancelledBy}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
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

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  const { token, handleApiError } = useAuth();
  const { toast } = useToast();

  const [customerData, setCustomerData] = useState<CustomerDetailsResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchCustomerDetails = useCallback(async () => {
    if (!token || !customerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/customers/${customerId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'ngrok-skip-browser-warning': 'true' 
        }
      });
      
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      
      const result: CustomerDetailsResponse = await response.json();
      
      if (result.success) {
        setCustomerData(result.data);
      } else {
        setError(result.message || 'Failed to fetch customer details.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, token, handleApiError]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  // Pagination logic - always called to maintain hook order
  const totalPages = customerData ? Math.ceil(customerData.allOrders.length / ITEMS_PER_PAGE) : 0;
  const paginatedOrders = useMemo(() => {
    if (!customerData) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return customerData.allOrders.slice(startIndex, endIndex);
  }, [customerData, currentPage]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error || !customerData) {
    return (
      <AppShell>
        <PageHeader title="Customer Details">
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
                <p className="text-destructive">{error || 'Customer not found'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const { customer, statistics, deliveryAgents, allOrders } = customerData;

  return (
    <AppShell>
      <PageHeader title="Customer Details">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </PageHeader>

      {/* Customer Profile Card */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={customer.profileImage || undefined} />
              <AvatarFallback className="text-lg">
                {customer.name ? customer.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold">{customer.name || 'Unknown Customer'}</h2>
                <Badge variant={customer.isBlocked ? 'destructive' : 'secondary'}>
                  {customer.isBlocked ? 'Blocked' : 'Active'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email || 'No email'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone || 'No phone'}</a>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
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
              <Truck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{statistics.completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
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
              <Package className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancel Orders</p>
                <p className="text-2xl font-bold">{statistics.cancelledOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Orders and Agents */}
      <Tabs defaultValue="orders" className="space-y-2">
        <TabsList>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="agents">Delivery Agents</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
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
                    This customer hasn't placed any orders yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Delivery Mode</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Assigned At</TableHead>
                        <TableHead>Agent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.orderNumber.slice(-8)}
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
                          <Badge variant={order.paymentStatus === 'pending' ? 'secondary' : 'default'}>
                            {order.paymentStatus || 'Not specified'}
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
                          {order.deliveryAgent ? (
                            <OrderDetailsDialog order={order}>
                              <div className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={order.deliveryAgent.profileImage} />
                                  <AvatarFallback className="text-xs">
                                    {order.deliveryAgent.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{order.deliveryAgent.name}</span>
                              </div>
                            </OrderDetailsDialog>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
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

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliveryAgents.map((agent) => (
                  <Card key={agent.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar>
                          <AvatarImage src={agent.profileImage} />
                          <AvatarFallback>{agent.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{agent.name}</h4>
                          <Badge variant={agent.status === 'online' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{agent.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span>{agent.vehicleNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{agent.agency.city}</span>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="text-xs text-muted-foreground">
                        Agency: {agent.agency.name}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Customer Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.addresses.map((address) => (
                  <Card key={address.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{address.title}</h4>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm">
                            <p>{address.address}</p>
                            <p className="text-muted-foreground">
                              {address.city}, {address.pincode}
                            </p>
                            {address.landmark && (
                              <p className="text-muted-foreground">
                                Near: {address.landmark}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
