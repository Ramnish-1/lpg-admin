
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Agent } from '@/lib/types';
import { Truck, IndianRupee, PieChart, CheckCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface AgentReportDialogProps {
  agent: Agent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const chartConfig = {
  deliveries: {
    label: "Deliveries",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


export function AgentReportDialog({ agent, isOpen, onOpenChange }: AgentReportDialogProps) {
  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={`https://picsum.photos/seed/${agent.id}/100`} alt={agent.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{agent.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                    <Truck className="h-6 w-6 text-primary" />
                    <span>{agent.name}'s Report</span>
                </DialogTitle>
                <DialogDescription>
                    Performance overview for this delivery agent.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{agent.report?.totalDeliveries}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{agent.report?.totalEarnings.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">On-time Rate</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{agent.report?.onTimeRate}%</div>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    <span>Monthly Deliveries</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={agent.report?.monthlyDeliveries}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="deliveries" fill="var(--color-deliveries)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
