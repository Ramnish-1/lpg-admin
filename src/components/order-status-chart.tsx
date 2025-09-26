
"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, isWithinInterval } from 'date-fns';
import { Order } from '@/lib/types';

const chartConfig = {
  pending: { label: "Pending", color: "hsl(var(--chart-2))" },
  delivered: { label: "Delivered", color: "hsl(var(--chart-1))" },
  cancelled: { label: "Cancelled", color: "hsl(var(--chart-4))" },
  out_for_delivery: { label: "Out for Delivery", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface OrderStatusChartProps {
    orders: Order[];
}

export function OrderStatusChart({ orders }: OrderStatusChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');

  const processedData = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    let interval;
    let formatLabel: (date: Date) => string;
    let getIntervals: (interval: Interval) => Date[];

    const today = new Date();

    switch(timeframe) {
      case 'daily':
        interval = { start: subDays(today, 6), end: today };
        getIntervals = (i) => eachDayOfInterval(i);
        formatLabel = (d) => format(d, 'EEE');
        break;
      case 'weekly':
        interval = { start: subDays(startOfWeek(today, { weekStartsOn: 1 }), 4*7), end: endOfWeek(today) };
        getIntervals = (i) => eachWeekOfInterval(i, { weekStartsOn: 1 });
        formatLabel = (d) => `W${format(d, 'w')}`;
        break;
      case 'monthly':
        interval = { start: startOfYear(today), end: endOfYear(today) };
        getIntervals = (i) => eachMonthOfInterval(i);
        formatLabel = (d) => format(d, 'MMM');
        break;
      case 'yearly':
        const oldestOrderDate = orders.reduce((oldest, order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate < oldest ? orderDate : oldest;
        }, new Date());
        interval = { start: startOfYear(oldestOrderDate), end: today };
        getIntervals = (i) => eachYearOfInterval(i);
        formatLabel = (d) => format(d, 'yyyy');
        break;
    }
    
    const intervals = getIntervals(interval);
    
    return intervals.map((startDate) => {
        let endDate: Date;
        if (timeframe === 'daily') endDate = startDate;
        else if (timeframe === 'weekly') endDate = endOfWeek(startDate, { weekStartsOn: 1 });
        else if (timeframe === 'monthly') endDate = endOfMonth(startDate);
        else endDate = endOfYear(startDate);
        
        const periodInterval = { start: startDate, end: endDate };

        const ordersInPeriod = orders.filter(order => isWithinInterval(new Date(order.createdAt), periodInterval));
        
        const counts = ordersInPeriod.reduce((acc, order) => {
            const statusKey = order.status.replace(/[\s-]/g, '_') as keyof typeof acc;
            if (statusKey === 'assigned' || statusKey === 'confirmed' || statusKey === 'in_progress') {
              acc.pending++;
            } else if (statusKey === 'returned') {
              acc.cancelled++;
            } else if (statusKey in acc) {
              acc[statusKey]++;
            }
            return acc;
          }, { pending: 0, delivered: 0, cancelled: 0, out_for_delivery: 0 });

        return {
            date: formatLabel(startDate),
            ...counts
        };
    });

  }, [orders, timeframe]);

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
        {processedData.length === 0 ? (
          <div className="h-[250px] w-full flex items-center justify-center">
             <p className="text-muted-foreground">No data to display for the selected period.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={processedData} accessibilityLayer stackOffset="sign">
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="pending" type="natural" fill="var(--color-pending)" fillOpacity={0.4} stroke="var(--color-pending)" stackId="a" />
              <Area dataKey="out_for_delivery" type="natural" fill="var(--color-out_for_delivery)" fillOpacity={0.4} stroke="var(--color-out_for_delivery)" stackId="a" />
              <Area dataKey="cancelled" type="natural" fill="var(--color-cancelled)" fillOpacity={0.4} stroke="var(--color-cancelled)" stackId="a" />
              <Area dataKey="delivered" type="natural" fill="var(--color-delivered)" fillOpacity={0.4} stroke="var(--color-delivered)" stackId="a" />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
