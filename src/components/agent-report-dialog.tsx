
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Agent } from '@/lib/types';
import { Truck, IndianRupee, PieChart, CheckCircle, Clock, Mail, Phone, User, Banknote, BadgeCheck } from 'lucide-react';
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

  const reportData = agent.report || {
    totalDeliveries: 0,
    totalEarnings: 0,
    onTimeRate: 0,
    monthlyDeliveries: [],
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-center text-sm">
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">{icon}</div>
        <div className="ml-2">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="font-medium text-foreground break-all">{value}</div>
        </div>
    </div>
);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={agent.profileImage} alt={agent.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{agent.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                    <span>{agent.name} Report</span>
                </DialogTitle>
                <DialogDescription>
                    Performance and personal details for this delivery agent.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4 overflow-y-auto pr-4 -mr-4">
            <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><PieChart className="h-5 w-5"/> Performance Metrics</h3>
                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportData.totalDeliveries}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{reportData.totalEarnings.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">On-time Rate</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportData.onTimeRate}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <span>Monthly Deliveries</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {reportData.monthlyDeliveries.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[150px] w-full">
                                <BarChart accessibilityLayer data={reportData.monthlyDeliveries}>
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
                            ) : (
                              <div className="text-center text-muted-foreground text-sm py-8">
                                No delivery data available.
                              </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div>
                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><User className="h-5 w-5"/> Agent Details</h3>
                 <Card>
                    <CardContent className="pt-6 space-y-4">
                        <InfoRow icon={<Mail className="h-5 w-5 text-primary"/>} label="Email" value={<a href={`mailto:${agent.email}`} className="hover:underline">{agent.email}</a>} />
                        <Separator />
                        <InfoRow icon={<Phone className="h-5 w-5 text-primary"/>} label="Phone" value={<a href={`tel:${agent.phone}`} className="hover:underline">{agent.phone}</a>} />
                        <Separator />
                        <InfoRow icon={<Truck className="h-5 w-5 text-primary"/>} label="Vehicle Number" value={agent.vehicleNumber} />
                        <Separator />
                        <InfoRow icon={<User className="h-5 w-5 text-primary"/>} label="PAN Card" value={agent.panCardNumber} />
                        <Separator />
                        <InfoRow icon={<User className="h-5 w-5 text-primary"/>} label="Aadhar Card" value={agent.aadharCardNumber} />
                        <Separator />
                        <InfoRow icon={<BadgeCheck className="h-5 w-5 text-primary"/>} label="Driving License" value={agent.drivingLicence} />
                        <Separator />
                        <InfoRow icon={<Banknote className="h-5 w-5 text-primary"/>} label="Bank Account" value={<div className="whitespace-pre-wrap">{agent.bankDetails}</div>} />
                    </CardContent>
                 </Card>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
