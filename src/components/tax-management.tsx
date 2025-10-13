"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import socketService from '@/lib/socket';

interface TaxConfig {
  id: number | null;
  percentage: number;
  fixedAmount: number;
}

export function TaxManagement() {
  const { token, handleApiError } = useAuth();
  const [taxConfig, setTaxConfig] = useState<TaxConfig>({
    id: null,
    percentage: 0,
    fixedAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [taxType, setTaxType] = useState<'percentage' | 'fixed'>('percentage');
  const [percentage, setPercentage] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const { toast } = useToast();

  // Socket event listeners for real-time updates
  useEffect(() => {
    const handleTaxUpdated = (data: any) => {
      console.log('💰 Tax updated via socket:', data);
      const taxData = data.data;
      setTaxConfig({
        id: taxData.id,
        percentage: taxData.percentage || 0,
        fixedAmount: taxData.fixedAmount || 0
      });
      
      if (taxData.percentage > 0) {
        setTaxType('percentage');
        setPercentage(taxData.percentage.toString());
        setFixedAmount('');
      } else if (taxData.fixedAmount > 0) {
        setTaxType('fixed');
        setFixedAmount(taxData.fixedAmount.toString());
        setPercentage('');
      }
      
      toast({
        title: "Tax Configuration Updated",
        description: "Tax settings have been updated by another admin",
      });
    };

    const handleTaxDeleted = (data: any) => {
      console.log('💰 Tax deleted via socket:', data);
      setTaxConfig({
        id: null,
        percentage: 0,
        fixedAmount: 0
      });
      setPercentage('');
      setFixedAmount('');
      
      toast({
        title: "Tax Configuration Removed",
        description: "Tax settings have been deleted by another admin",
      });
    };

    socketService.onTaxUpdated(handleTaxUpdated);
    socketService.onTaxDeleted(handleTaxDeleted);

    return () => {
      socketService.offTaxUpdated(handleTaxUpdated);
      socketService.offTaxDeleted(handleTaxDeleted);
    };
  }, [toast]);

  // Fetch current tax configuration
  const fetchTaxConfig = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to access tax configuration",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tax`, {
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
        setTaxConfig(data.data);
        if (data.data.percentage > 0) {
          setTaxType('percentage');
          setPercentage(data.data.percentage.toString());
          setFixedAmount('');
        } else if (data.data.fixedAmount > 0) {
          setTaxType('fixed');
          setFixedAmount(data.data.fixedAmount.toString());
          setPercentage('');
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch tax configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tax configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save tax configuration
  const saveTaxConfig = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to save tax configuration",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const payload: any = {};
      
      if (taxType === 'percentage') {
        const percentageValue = parseFloat(percentage);
        if (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100) {
          toast({
            title: "Invalid Input",
            description: "Percentage must be between 0 and 100",
            variant: "destructive"
          });
          return;
        }
        payload.percentage = percentageValue;
      } else {
        const fixedValue = parseFloat(fixedAmount);
        if (isNaN(fixedValue) || fixedValue < 0) {
          toast({
            title: "Invalid Input",
            description: "Fixed amount must be a positive number",
            variant: "destructive"
          });
          return;
        }
        payload.fixedAmount = fixedValue;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tax`, {
        method: 'POST',
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
        setTaxConfig(data.data);
        toast({
          title: "Success",
          description: data.message || "Tax configuration saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save tax configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tax configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete tax configuration
  const deleteTaxConfig = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to delete tax configuration",
        variant: "destructive"
      });
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tax`, {
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
        setTaxConfig({
          id: null,
          percentage: 0,
          fixedAmount: 0
        });
        setPercentage('');
        setFixedAmount('');
        setTaxType('percentage');
        toast({
          title: "Success",
          description: data.message || "Tax configuration deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete tax configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tax configuration",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTaxConfig();
    }
  }, [token]);

  const hasTaxConfig = taxConfig.id !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tax Management
          {hasTaxConfig && (
            <span className="text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Configured
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Configure tax settings for your application. You can set either percentage-based or fixed amount tax.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading tax configuration...</span>
          </div>
        ) : (
          <>
            {/* Current Configuration Display */}
            {hasTaxConfig && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Current Tax Configuration:</strong>
                  {taxConfig.percentage > 0 ? (
                    <span> {taxConfig.percentage}% tax rate</span>
                  ) : (
                    <span> ₹{taxConfig.fixedAmount} fixed tax amount</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Tax Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tax Type</Label>
              <RadioGroup value={taxType} onValueChange={(value: 'percentage' | 'fixed') => setTaxType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="percentage" />
                  <Label htmlFor="percentage">Percentage-based Tax</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed">Fixed Amount Tax</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Tax Configuration Inputs */}
            <div className="space-y-4">
              {taxType === 'percentage' ? (
                <div className="space-y-2">
                  <Label htmlFor="percentage-input">Tax Percentage (%)</Label>
                  <div className="relative">
                    <Input
                      id="percentage-input"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Enter tax percentage (0-100)"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Example: 10% means ₹10 tax on ₹100 order
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="fixed-amount-input">Fixed Tax Amount (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="fixed-amount-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter fixed tax amount"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Example: ₹50 means ₹50 tax on every order
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={saveTaxConfig} 
                disabled={saving || (taxType === 'percentage' ? !percentage : !fixedAmount)}
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
                    {hasTaxConfig ? 'Update Tax Configuration' : 'Save Tax Configuration'}
                  </>
                )}
              </Button>
              
              {hasTaxConfig && (
                <Button 
                  variant="destructive" 
                  onClick={deleteTaxConfig}
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
