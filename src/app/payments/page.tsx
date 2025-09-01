
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Payment, PaymentMethod } from '@/lib/types';
import { IndianRupee, MoreHorizontal, Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo, useContext } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EditPaymentMethodDialog } from '@/components/edit-payment-method-dialog';
import { AuthContext } from '@/context/auth-context';


const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token } = useContext(AuthContext);

  const fetchPayments = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPayments(result.data.payments);
      } else {
         toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to fetch payments.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch payments.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMethods = async () => {
    if (!token) return;
     try {
       const response = await fetch(`${API_BASE_URL}/api/payment-methods`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPaymentMethods(result.data.methods);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to fetch payment methods.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch payment methods.' });
    }
  }

  useEffect(() => {
    if (token) {
      fetchPayments();
      fetchMethods();
    }
  }, [token]);

  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return payments.slice(startIndex, endIndex);
  }, [payments, currentPage]);
  
  const totalRevenue = payments.filter(p => p.status === 'Success').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const refundedAmount = payments.filter(p => p.status === 'Refunded').reduce((sum, p) => sum + p.amount, 0);

  const paymentStatusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Success': 'default',
    'Pending': 'secondary',
    'Refunded': 'destructive',
  };

  const handleToggleStatus = async (methodId: string) => {
    if (!token) return;
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    const newStatus = method.status === 'Active' ? 'Inactive' : 'Active';
    
    try {
       const response = await fetch(`${API_BASE_URL}/api/payment-methods/${methodId}/status`, {
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
              title: 'Payment Method Updated',
              description: `${method.name} is now ${newStatus}.`
            });
            fetchMethods(); // Re-fetch to get the latest state
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
        }

    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const handleEditClick = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsEditOpen(true);
  }
  
  const handleMethodUpdate = async (updatedMethod: PaymentMethod) => {
     if (!token) return;

     try {
        const { id, ...payload } = updatedMethod;
        const response = await fetch(`${API_BASE_URL}/api/payment-methods/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            toast({
              title: 'Payment Method Saved',
              description: `${updatedMethod.name} details have been updated.`
            });
            fetchMethods();
            setIsEditOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to save method.' });
        }
     } catch (error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Failed to save method.' });
     }
  }


  return (
    <AppShell>
      <PageHeader title="Payments & Finance" />
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <IndianRupee className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <IndianRupee className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{refundedAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
           <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Activate or deactivate payment methods available to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Method</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paymentMethods.map(method => (
                        <TableRow key={method.id}>
                            <TableCell className="font-medium">{method.name}</TableCell>
                            <TableCell>{method.description}</TableCell>
                            <TableCell className="text-center">
                                <Switch 
                                    checked={method.status === 'Active'}
                                    onCheckedChange={() => handleToggleStatus(method.id)}
                                    aria-label={`Toggle ${method.name}`}
                                />
                            </TableCell>
                            <TableCell>
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditClick(method)}>
                                            Edit Details
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              A log of all payments processed through the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">#{payment.id.slice(0, 6)}</TableCell>
                      <TableCell className="text-primary hover:underline cursor-pointer">#{payment.orderId.slice(0, 6)}</TableCell>
                      <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusVariant[payment.status]}>{payment.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(payment.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {paginatedPayments.length} of {payments.length} payments.
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
      </div>

      {selectedMethod && (
        <EditPaymentMethodDialog
            method={selectedMethod}
            isOpen={isEditOpen}
            onOpenChange={setIsEditOpen}
            onMethodUpdate={handleMethodUpdate}
        />
      )}
    </AppShell>
  );
}
