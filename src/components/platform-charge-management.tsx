"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, Save, AlertCircle, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import socketService from '@/lib/socket';

interface PlatformCharge {
  id: number | null;
  amount: number;
}

export function PlatformChargeManagement() {
  const { token, handleApiError } = useAuth();
  const [platformCharge, setPlatformCharge] = useState<PlatformCharge>({
    id: null,
    amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  // Socket event listeners for real-time updates
  useEffect(() => {
    const handlePlatformChargeUpdated = (data: any) => {
      console.log('🏦 Platform charge updated via socket:', data);
      const chargeData = data.data;
      setPlatformCharge({
        id: chargeData.id,
        amount: chargeData.amount || 0
      });
      setAmount(chargeData.amount?.toString() || '');
      
      toast({
        title: "Platform Charge Updated",
        description: `Platform charge is now ₹${chargeData.amount}`,
      });
    };

    const handlePlatformChargeDeleted = (data: any) => {
      console.log('🏦 Platform charge deleted via socket:', data);
      setPlatformCharge({
        id: null,
        amount: 0
      });
      setAmount('');
      
      toast({
        title: "Platform Charge Removed",
        description: "Platform charge has been deleted by another admin",
      });
    };

    socketService.onPlatformChargeUpdated(handlePlatformChargeUpdated);
    socketService.onPlatformChargeDeleted(handlePlatformChargeDeleted);

    return () => {
      socketService.offPlatformChargeUpdated(handlePlatformChargeUpdated);
      socketService.offPlatformChargeDeleted(handlePlatformChargeDeleted);
    };
  }, [toast]);

  // Fetch current platform charge
  const fetchPlatformCharge = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to access platform charge configuration",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/platform-charge`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        handleApiError(response);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setPlatformCharge(data.data);
        if (data.data.amount > 0) {
          setAmount(data.data.amount.toString());
        } else {
          setAmount('');
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch platform charge configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch platform charge configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save platform charge
  const savePlatformCharge = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to save platform charge configuration",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue < 0) {
        toast({
          title: "Invalid Input",
          description: "Amount must be a positive number",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/platform-charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ amount: amountValue }),
      });

      if (!response.ok) {
        handleApiError(response);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setPlatformCharge(data.data);
        toast({
          title: "Success",
          description: data.message || "Platform charge saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save platform charge configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save platform charge configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete platform charge
  const deletePlatformCharge = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to delete platform charge configuration",
        variant: "destructive"
      });
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/platform-charge`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        handleApiError(response);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setPlatformCharge({
          id: null,
          amount: 0
        });
        setAmount('');
        toast({
          title: "Success",
          description: data.message || "Platform charge deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete platform charge configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete platform charge configuration",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPlatformCharge();
    }
  }, [token]);

  const hasPlatformCharge = platformCharge.id !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Platform Charge Management
          {hasPlatformCharge && (
            <span className="text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Configured
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Configure platform charge for orders. This is a fixed amount charged per order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading platform charge configuration...</span>
          </div>
        ) : (
          <>
            {/* Current Configuration Display */}
            {hasPlatformCharge && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Current Platform Charge:</strong>
                  <span className="flex items-center ml-2">
                    <IndianRupee className="h-4 w-4" />
                    {platformCharge.amount} per order
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* Platform Charge Input */}
            <div className="space-y-2">
              <Label htmlFor="platform-charge-input">Platform Charge Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="platform-charge-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter platform charge amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Example: ₹50 means ₹50 platform charge on every order
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={savePlatformCharge} 
                disabled={saving || !amount}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {hasPlatformCharge ? 'Update Platform Charge' : 'Save Platform Charge'}
                  </>
                )}
              </Button>
              
              {hasPlatformCharge && (
                <Button 
                  variant="destructive" 
                  onClick={deletePlatformCharge}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
