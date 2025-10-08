
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { TaxManagement } from '@/components/tax-management';
import { PlatformChargeManagement } from '@/components/platform-charge-management';
import { CouponManagement } from '@/components/coupon-management';
import { Toaster } from '@/components/ui/toaster';
import { ProfileContext } from '@/context/profile-context';
import { useContext } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

export default function SettingsPage() {
  const { profile } = useContext(ProfileContext);
  
  // Check user roles
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
  const isAgencyOwner = profile.role === 'agency_owner';
  const hasSettingsAccess = isAdmin || isAgencyOwner;

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        <PageHeader title="Settings" />
        <div className="flex-1 overflow-auto py-6 pr-4 -mr-4">
          <div className="grid gap-6">
            {hasSettingsAccess ? (
              <>
                {isAdmin && (
                  <>
                    <TaxManagement />
                    <PlatformChargeManagement />
                  </>
                )}
                {isAgencyOwner && (
                  <CouponManagement />
                )}
              </>
            ) : (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to access settings. Only administrators can manage tax and platform charges, and agency owners can manage coupons.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </AppShell>
  );
}
