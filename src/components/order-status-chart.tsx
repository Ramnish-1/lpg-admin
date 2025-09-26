
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, isWithinInterval, getYear } from 'date-fns';
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
  const [chartData, setChartData] = useState<any[]>([]);

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
        interval = { start: subDays(startOfWeek(today), 4*7), end: endOfWeek(today) };
        getIntervals = (i) => eachWeekOfInterval(i, { weekStartsOn: 1 });
        formatLabel = (d) => format(d, 'MMM d');
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
        interval = { start: oldestOrderDate, end: today };
        getIntervals = (i) => eachYearOfInterval(i);
        formatLabel = (d) => format(d, 'yyyy');
        break;
    }
    
    const intervals = getIntervals(interval);
    
    return intervals.map((startDate, index) => {
        let endDate: Date;
        if (timeframe === 'daily') endDate = startDate;
        else if (timeframe === 'weekly') endDate = endOfWeek(startDate, { weekStartsOn: 1 });
        else if (timeframe === 'monthly') endDate = endOfMonth(startDate);
        else endDate = endOfYear(startDate);
        
        const periodInterval = { start: startDate, end: endDate };

        const ordersInPeriod = orders.filter(order => isWithinInterval(new Date(order.createdAt), periodInterval));
        
        const counts = ordersInPeriod.reduce((acc, order) => {
            const status = order.status.replace('-', '_') as keyof typeof chartConfig;
            if (acc[status]) {
                acc[status]++;
            } else if (status === 'assigned' || status === 'confirmed' || status === 'in_progress') {
                acc['pending']++; // Grouping into pending for simplicity
            } else if (status === 'returned') {
                 acc['cancelled']++; // Grouping into cancelled
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
            <BarChart data={processedData} accessibilityLayer>
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
