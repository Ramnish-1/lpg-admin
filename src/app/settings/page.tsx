
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/context/settings-context';
import type { Availability, DayAvailability } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

type DayKey = keyof Availability;

const daysOfWeek: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SettingsPage() {
  const { tempSettings, setTempSettings, saveSettings } = useSettings();

  const handleAvailabilityChange = (day: DayKey, value: Partial<DayAvailability>) => {
    const updatedAvailability = {
      ...tempSettings.availability,
      [day]: {
        ...tempSettings.availability[day],
        ...value,
      },
    };
    setTempSettings({ availability: updatedAvailability });
  };


  return (
    <AppShell>
      <PageHeader title="Settings" />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage application-wide settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="appName">Application Name</Label>
              <Input 
                id="appName" 
                value={tempSettings.appName} 
                onChange={(e) => setTempSettings({ appName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input 
                id="timezone" 
                value={tempSettings.timezone}
                onChange={(e) => setTempSettings({ timezone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service Availability</CardTitle>
            <CardDescription>Define when your services are available to customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map((day, index) => (
              <div key={day}>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${day}-available`} className="capitalize font-medium">{day}</Label>
                   <Switch 
                    id={`${day}-available`}
                    checked={tempSettings.availability[day].available}
                    onCheckedChange={(checked) => handleAvailabilityChange(day, { available: checked })}
                  />
                </div>
                 <div className={`grid grid-cols-2 gap-4 mt-2 ${!tempSettings.availability[day].available ? 'opacity-50' : ''}`}>
                    <div>
                      <Label htmlFor={`${day}-start`} className="text-xs text-muted-foreground">Start Time</Label>
                      <Input
                        id={`${day}-start`}
                        type="time"
                        value={tempSettings.availability[day].startTime}
                        onChange={(e) => handleAvailabilityChange(day, { startTime: e.target.value })}
                        disabled={!tempSettings.availability[day].available}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${day}-end`} className="text-xs text-muted-foreground">End Time</Label>
                      <Input
                        id={`${day}-end`}
                        type="time"
                        value={tempSettings.availability[day].endTime}
                        onChange={(e) => handleAvailabilityChange(day, { endTime: e.target.value })}
                        disabled={!tempSettings.availability[day].available}
                      />
                    </div>
                  </div>
                {index < daysOfWeek.length - 1 && <Separator className="mt-4"/>}
              </div>
            ))}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email.</p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={tempSettings.emailNotifications}
                  onCheckedChange={(checked) => setTempSettings({ emailNotifications: checked })}
                />
            </div>
             <div className="flex items-center justify-between">
                 <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get real-time alerts on your devices.</p>
                </div>
                <Switch 
                  id="push-notifications"
                  checked={tempSettings.pushNotifications}
                  onCheckedChange={(checked) => setTempSettings({ pushNotifications: checked })}
                />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
            <Button onClick={saveSettings}>Save All Settings</Button>
        </div>
      </div>
    </AppShell>
  );
}
