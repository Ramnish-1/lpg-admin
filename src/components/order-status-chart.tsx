
"use client";

import { useState, useEffect, useCallback, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/context/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const chartConfig = {
  pending: { label: "Pending", color: "hsl(var(--chart-2))" },
  delivered: { label: "Delivered", color: "hsl(var(--chart-1))" },
  cancelled: { label: "Cancelled", color: "hsl(var(--chart-4))" },
  out_for_delivery: { label: "Out for Delivery", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

export function OrderStatusChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const { token, handleApiError } = useAuth();

  const fetchData = useCallback(async (selectedTimeframe: Timeframe) => {
    if (!token) return;
    setIsLoading(true);

    let startDate, endDate;
    const today = new Date();

    switch(selectedTimeframe) {
        case 'daily':
            startDate = format(subDays(today, 6), 'yyyy-MM-dd');
            endDate = format(today, 'yyyy-MM-dd');
            break;
        case 'weekly':
            startDate = format(subDays(startOfWeek(today), 4*7), 'yyyy-MM-dd');
            endDate = format(endOfWeek(today), 'yyyy-MM-dd');
            break;
        case 'monthly':
            startDate = format(startOfYear(today), 'yyyy-MM-dd');
            endDate = format(endOfYear(today), 'yyyy-MM-dd');
            break;
        case 'yearly':
            startDate = format(subDays(today, 365 * 2), 'yyyy-MM-dd'); // last 2 years
            endDate = format(today, 'yyyy-MM-dd');
            break;
    }

    try {
      const url = `${API_BASE_URL}/api/dashboard/order-stats?timeframe=${selectedTimeframe}&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setData(result.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, handleApiError]);

  useEffect(() => {
    fetchData(timeframe);
  }, [timeframe, fetchData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Order Status Overview</CardTitle>
            <CardDescription>A summary of order statuses over time.</CardDescription>
          </div>
          <Select onValueChange={(value) => setTimeframe(value as Timeframe)} defaultValue={timeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[250px] w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="out_for_delivery" stackId="a" fill="var(--color-out_for_delivery)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="cancelled" stackId="a" fill="var(--color-cancelled)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="delivered" stackId="a" fill="var(--color-delivered)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
