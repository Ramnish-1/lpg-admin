
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/context/auth-context';
import { Order } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { OrderDetailsView } from '@/components/order-details-view';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const { token, handleApiError } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchOrder = useCallback(async () => {
        if (!token || !orderId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
                 headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
            });
            if (!response.ok) {
                handleApiError(response);
                return;
            }
            const result = await response.json();
            if (result.success) {
                setOrder(result.data.order);
            } else {
                setError(result.error || 'Failed to fetch order details.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }

    }, [orderId, token, handleApiError]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);
    
    const onUpdate = () => {
        // For now, just refetch the order. In a more complex app,
        // you might optimistically update the state.
        fetchOrder();
    }
    
    return (
        <AppShell>
            <PageHeader title={isLoading ? 'Loading Order...' : order ? `Order #${order.orderNumber}` : 'Order Not Found'} />
            {isLoading && (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {!isLoading && order && (
                <OrderDetailsView order={order} onUpdate={onUpdate} />
            )}
        </AppShell>
    )

}
