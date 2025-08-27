
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPaymentsData, getPaymentMethodsData } from '@/lib/data';
import type { Payment, PaymentMethod } from '@/lib/types';
import { IndianRupee, MoreHorizontal } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EditPaymentMethodDialog } from '@/components/edit-payment-method-dialog';

const PAYMENTS_STORAGE_KEY = 'gastrack-payments-db';
const PAYMENT_METHODS_STORAGE_KEY = 'gastrack-payment-methods-db';
const ITEMS_PER_PAGE = 10;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const savedData = window.localStorage.getItem(PAYMENTS_STORAGE_KEY);
        setPayments(savedData ? JSON.parse(savedData) : await getPaymentsData());
      } catch (e) {
        setPayments(await getPaymentsData());
      }
    };
    
    const fetchMethods = async () => {
       try {
        const savedData = window.localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
        setPaymentMethods(savedData ? JSON.parse(savedData) : await getPaymentMethodsData());
      } catch (e) {
        setPaymentMethods(await getPaymentMethodsData());
      }
    }

    fetchPayments();
    fetchMethods();
  }, []);

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

  const updatePaymentMethods = (newMethods: PaymentMethod[]) => {
    setPaymentMethods(newMethods);
    try {
      window.localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(newMethods));
    } catch (e) {
      console.error("Failed to save payment methods", e);
    }
  }

  const handleToggleStatus = (methodId: string) => {
    const newMethods = paymentMethods.map(m => 
      m.id === methodId ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m
    );
    const toggledMethod = newMethods.find(m => m.id === methodId);
    updatePaymentMethods(newMethods);
    toast({
      title: 'Payment Method Updated',
      description: `${toggledMethod?.name} is now ${toggledMethod?.status}.`
    });
  };

  const handleEditClick = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsEditOpen(true);
  }
  
  const handleMethodUpdate = (updatedMethod: PaymentMethod) => {
     const newMethods = paymentMethods.map(m => 
      m.id === updatedMethod.id ? updatedMethod : m
    );
    updatePaymentMethods(newMethods);
     toast({
      title: 'Payment Method Saved',
      description: `${updatedMethod.name} details have been updated.`
    });
    setIsEditOpen(false);
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
