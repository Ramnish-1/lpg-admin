
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { getOrderById } from '@/lib/data';
import type { Order, Agent, User } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface EnrichedOrder extends Order {
    agent?: Agent;
    customer?: User;
}

export default function TrackOrderPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<EnrichedOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderId) {
            getOrderById(orderId)
                .then(data => {
                    if (data) {
                        setOrder(data as EnrichedOrder);
                    } else {
                        setError("Order not found.");
                    }
                })
                .catch(() => setError("Failed to fetch order details."))
                .finally(() => setLoading(false));
        }
    }, [orderId]);

    const getMapUrl = () => {
        if (!order?.agent?.currentLocation || !order?.customer?.location) {
            return "";
        }
        const agentLoc = `${order.agent.currentLocation.lat},${order.agent.currentLocation.lng}`;
        const customerLoc = `${order.customer.location.lat},${order.customer.location.lng}`;
        
        // This URL will show directions from the agent to the customer.
        return `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${agentLoc}&destination=${customerLoc}&mode=driving`;
    }

    if (loading) {
        return (
            <AppShell>
                <PageHeader title="Track Order" />
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Loading map...</p>
                </div>
            </AppShell>
        );
    }
    
    if (error) {
        return (
             <AppShell>
                <PageHeader title="Track Order" />
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </AppShell>
        )
    }

    if (!order) return null;


    return (
        <AppShell>
            <PageHeader title={`Tracking Order #${order.id.slice(0, 6)}`} />
            <Card>
                <CardContent className="p-0">
                    <div className="h-[600px] w-full">
                         {order.agent?.currentLocation && order.customer?.location ? (
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                src={getMapUrl()}
                            >
                            </iframe>
                         ) : (
                            <div className="flex items-center justify-center h-full">
                                <Alert>
                                    <AlertTitle>Location Data Missing</AlertTitle>
                                    <AlertDescription>Cannot display map because agent or customer location is not available.</AlertDescription>
                                </Alert>
                            </div>
                         )}
                    </div>
                </CardContent>
            </Card>
        </AppShell>
    );
}
