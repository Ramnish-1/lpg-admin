
"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartConfig = {
  totalRevenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface SalesChartProps {
  salesByDay: { day: string; totalRevenue: number }[];
}

export function SalesChart({ salesByDay }: SalesChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <LineChart accessibilityLayer data={salesByDay}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis 
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <ChartTooltip 
            cursor={false}
            content={
                <ChartTooltipContent 
                    indicator='line'
                    formatter={(value) => `₹${value.toLocaleString()}`}
                />
            } 
        />
        <Line 
            dataKey="totalRevenue" 
            type="monotone"
            stroke="var(--color-totalRevenue)" 
            strokeWidth={2}
            dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
