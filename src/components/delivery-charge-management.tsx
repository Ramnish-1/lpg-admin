"use client";

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, Save, AlertCircle, IndianRupee, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { ProfileContext } from '@/context/profile-context';
import socketService from '@/lib/socket';

interface DeliveryCharge {
  id: string;
  agencyId: string;
  chargeType: 'per_km' | 'fixed';
  ratePerKm: string | number | null;
  fixedAmount: string | number | null;
  deliveryRadius: string | number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export function DeliveryChargeManagement() {
  const { token, handleApiError } = useAuth();
  const { profile } = useContext(ProfileContext);
  const [deliveryCharge, setDeliveryCharge] = useState<DeliveryCharge | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [chargeType, setChargeType] = useState<'per_km' | 'fixed'>('per_km');
  const [ratePerKm, setRatePerKm] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('');
  const { toast} = useToast();

  // Socket event listeners for real-time updates
  useEffect(() => {
    const handleDeliveryChargeUpdated = (data: any) => {
      console.log('🚚 Delivery charge updated via socket:', data);
      const chargeData = data.data;
      
      // Only update if it's for current agency
      if (profile?.agencyId && chargeData.agencyId === profile.agencyId) {
        setDeliveryCharge(chargeData);
        setChargeType(chargeData.chargeType);
        setRatePerKm(chargeData.ratePerKm?.toString() || '');
        setFixedAmount(chargeData.fixedAmount?.toString() || '');
        setDeliveryRadius(chargeData.deliveryRadius?.toString() || '');
        
        toast({
          title: "Delivery Charge Updated",
          description: "Delivery charge settings have been updated",
        });
      }
    };

    const handleDeliveryChargeDeleted = (data: any) => {
      console.log('🚚 Delivery charge deleted via socket:', data);
      const chargeData = data.data;
      
      // Only update if it's for current agency
      if (profile?.agencyId && chargeData.agencyId === profile.agencyId) {
        setDeliveryCharge(null);
        setRatePerKm('');
        setFixedAmount('');
        setDeliveryRadius('');
        
        toast({
          title: "Delivery Charge Removed",
          description: "Delivery charge has been deleted",
        });
      }
    };

    socketService.onDeliveryChargeUpdated(handleDeliveryChargeUpdated);
    socketService.onDeliveryChargeDeleted(handleDeliveryChargeDeleted);

    return () => {
      socketService.offDeliveryChargeUpdated(handleDeliveryChargeUpdated);
      socketService.offDeliveryChargeDeleted(handleDeliveryChargeDeleted);
    };
  }, [profile, toast]);

  // Check if user is agency owner
  const isAgencyOwner = profile.role === 'agency_owner';
  const agencyId = profile.agencyId;

  // Fetch delivery charge
  const fetchDeliveryCharge = async () => {
    if (!token || !isAgencyOwner || !agencyId) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/delivery-charges/agency/${agencyId}`, {
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
      
      if (data.success && data.data) {
        setDeliveryCharge(data.data);
        setChargeType(data.data.chargeType);
        setDeliveryRadius(data.data.deliveryRadius?.toString() || '');
        if (data.data.chargeType === 'per_km') {
          setRatePerKm(data.data.ratePerKm?.toString() || '');
          setFixedAmount('');
        } else {
          setFixedAmount(data.data.fixedAmount?.toString() || '');
          setRatePerKm('');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch delivery charge",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save delivery charge
  const saveDeliveryCharge = async () => {
    if (!token || !isAgencyOwner || !agencyId) return;

    setSaving(true);
    try {
      const payload: any = {};

      // Only add agencyId for POST (create), not for PUT (update)
      if (!deliveryCharge) {
        payload.agencyId = agencyId;
      }

      payload.chargeType = chargeType;
      payload.status = 'active';

      // Validate delivery radius
      const radius = parseFloat(deliveryRadius);
      if (isNaN(radius) || radius < 0) {
        toast({
          title: "Invalid Input",
          description: "Delivery radius must be a positive number",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }
      payload.deliveryRadius = radius;

      if (chargeType === 'per_km') {
        const rate = parseFloat(ratePerKm);
        if (isNaN(rate) || rate < 0) {
          toast({
            title: "Invalid Input",
            description: "Rate per km must be a positive number",
            variant: "destructive"
          });
          setSaving(false);
          return;
        }
        payload.ratePerKm = rate;
      } else {
        const amount = parseFloat(fixedAmount);
        if (isNaN(amount) || amount < 0) {
          toast({
            title: "Invalid Input",
            description: "Fixed amount must be a positive number",
            variant: "destructive"
          });
          setSaving(false);
          return;
        }
        payload.fixedAmount = amount;
      }

      const url = deliveryCharge 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/delivery-charges/${deliveryCharge.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/delivery-charges`;
      
      const method = deliveryCharge ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        handleApiError(response);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setDeliveryCharge(data.data);
        toast({
          title: "Success",
          description: data.message || "Delivery charge saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save delivery charge",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save delivery charge",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete delivery charge
  const deleteDeliveryCharge = async () => {
    if (!token || !isAgencyOwner || !deliveryCharge) return;

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/delivery-charges/${deliveryCharge.id}`, {
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
        setDeliveryCharge(null);
        setRatePerKm('');
        setFixedAmount('');
        setDeliveryRadius('');
        setChargeType('per_km');
        toast({
          title: "Success",
          description: data.message || "Delivery charge deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete delivery charge",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete delivery charge",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (token && isAgencyOwner && agencyId) {
      fetchDeliveryCharge();
    }
  }, [token, isAgencyOwner, agencyId]);

  if (!isAgencyOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delivery Charge Management</CardTitle>
          <CardDescription>Configure delivery charges for your agency.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only agency owners can manage delivery charges.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Charge Management
          {deliveryCharge && (
            <span className="text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Configured
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Configure delivery charges for your agency. You can set either kilometer-wise or fixed delivery charges.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading delivery charge...</span>
          </div>
        ) : (
          <>
            {/* Current Configuration Display */}
            {deliveryCharge && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Current Delivery Charge:</strong>
                      {deliveryCharge.chargeType === 'per_km' ? (
                        <span className="flex items-center ml-2">
                          <IndianRupee className="h-4 w-4" />
                          {parseFloat(deliveryCharge.ratePerKm?.toString() || '0')} per km
                        </span>
                      ) : (
                        <span className="flex items-center ml-2">
                          <IndianRupee className="h-4 w-4" />
                          {parseFloat(deliveryCharge.fixedAmount?.toString() || '0')} fixed charge
                        </span>
                      )}
                    </div>
                    <div>
                      <strong>Delivery Radius:</strong>
                      <span className="ml-2">{parseFloat(deliveryCharge.deliveryRadius?.toString() || '0')} km</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Charge Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Charge Type</Label>
              <RadioGroup value={chargeType} onValueChange={(value: 'per_km' | 'fixed') => setChargeType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="per_km" id="per_km" />
                  <Label htmlFor="per_km">Per Kilometer Charge</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed">Fixed Charge</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Delivery Radius Input */}
            <div className="space-y-2">
              <Label htmlFor="delivery-radius">Delivery Radius (km)</Label>
              <div className="relative">
                <Input
                  id="delivery-radius"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter delivery radius in kilometers"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(e.target.value)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  km
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Example: 60 km means delivery available within 60 km radius from your agency
              </p>
            </div>

            {/* Charge Configuration Inputs */}
            <div className="space-y-4">
              {chargeType === 'per_km' ? (
                <div className="space-y-2">
                  <Label htmlFor="rate-per-km">Rate per Kilometer (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="rate-per-km"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter rate per kilometer"
                      value={ratePerKm}
                      onChange={(e) => setRatePerKm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Example: ₹5 per km means ₹50 charge for 10 km delivery
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="fixed-amount">Fixed Delivery Charge (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="fixed-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter fixed delivery charge"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Example: ₹50 means ₹50 delivery charge for all orders
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={saveDeliveryCharge} 
                disabled={saving || !deliveryRadius || (chargeType === 'per_km' ? !ratePerKm : !fixedAmount)}
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
                    {deliveryCharge ? 'Update Delivery Charge' : 'Save Delivery Charge'}
                  </>
                )}
              </Button>
              
              {deliveryCharge && (
                <Button 
                  variant="destructive" 
                  onClick={deleteDeliveryCharge}
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
