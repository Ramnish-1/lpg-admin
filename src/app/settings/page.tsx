
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/context/settings-context';

export default function SettingsPage() {
  const { tempSettings, setTempSettings, saveSettings } = useSettings();

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
