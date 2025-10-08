"use client";

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Edit, Trash2, AlertCircle, IndianRupee, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { ProfileContext } from '@/context/profile-context';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string | number;
  minAmount: string | number;
  maxAmount: string | number | null;
  expiryDate: string;
  expiryTime: string;
  agencyId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  Agency?: {
    id: string;
    name: string;
    email: string;
  };
}

interface CouponFormData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minAmount: string;
  maxAmount: string;
  expiryDate: string;
  expiryTime: string;
}

export function CouponManagement() {
  const { token, handleApiError } = useAuth();
  const { profile } = useContext(ProfileContext);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minAmount: '',
    maxAmount: '',
    expiryDate: '',
    expiryTime: ''
  });
  const { toast } = useToast();

  // Check if user has permission
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
  const isAgencyOwner = profile.role === 'agency_owner';
  const hasPermission = isAdmin || isAgencyOwner;

  // Fetch all coupons
  const fetchCoupons = async () => {
    if (!token || !hasPermission) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupons?page=1&limit=50`, {
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
        console.log('Coupons fetched:', data.data.coupons);
        setCoupons(data.data.coupons);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch coupons",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create or update coupon
  const saveCoupon = async () => {
    if (!token || !hasPermission) return;

    setSaving(true);
    try {
      const payload: any = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minAmount: parseFloat(formData.minAmount),
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
        expiryDate: formData.expiryDate,
        expiryTime: formData.expiryTime
      };

      // Add agencyId for admin users (agency owners will use their own agency)
      if (isAdmin && profile.agencyId) {
        payload.agencyId = profile.agencyId;
      }

      const url = editingCoupon 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupons/${editingCoupon.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupons`;
      
      const method = editingCoupon ? 'PUT' : 'POST';

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
        toast({
          title: "Success",
          description: data.message || "Coupon saved successfully",
        });
        setIsDialogOpen(false);
        setEditingCoupon(null);
        resetForm();
        fetchCoupons();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save coupon",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save coupon",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle coupon status
  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    if (!token || !hasPermission) return;

    setDeleting(couponId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupons/${couponId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        handleApiError(response);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Coupon status updated successfully",
        });
        fetchCoupons();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update coupon status",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coupon status",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  // Delete coupon
  const deleteCoupon = async (couponId: string) => {
    if (!token || !hasPermission) return;

    setDeleting(couponId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupons/${couponId}`, {
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
        toast({
          title: "Success",
          description: data.message || "Coupon deleted successfully",
        });
        fetchCoupons();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete coupon",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minAmount: '',
      maxAmount: '',
      expiryDate: '',
      expiryTime: ''
    });
  };

  // Open dialog for editing
  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: parseFloat(coupon.discountValue.toString()).toString(),
      minAmount: parseFloat(coupon.minAmount.toString()).toString(),
      maxAmount: coupon.maxAmount ? parseFloat(coupon.maxAmount.toString()).toString() : '',
      expiryDate: coupon.expiryDate,
      expiryTime: coupon.expiryTime
    });
    setIsDialogOpen(true);
  };

  // Open dialog for creating
  const openCreateDialog = () => {
    setEditingCoupon(null);
    resetForm();
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (token && hasPermission) {
      fetchCoupons();
    }
  }, [token, hasPermission]);

  if (!hasPermission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coupon Management</CardTitle>
          <CardDescription>Manage discount coupons for your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to manage coupons. Only administrators and agency owners can access this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Coupon Management</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g., SAVE30"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select value={formData.discountType} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discountType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      placeholder={formData.discountType === 'percentage' ? '30' : '100'}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      placeholder="500"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Maximum Amount (₹) - Optional</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      placeholder="1000 (leave empty for unlimited)"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryTime">Expiry Time</Label>
                  <Input
                    id="expiryTime"
                    type="time"
                    value={formData.expiryTime}
                    onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCoupon} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    editingCoupon ? 'Update Coupon' : 'Create Coupon'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading coupons...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No coupons found. Create your first coupon to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Amount</TableHead>
                  <TableHead>Max Amount</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {coupon.discountType === 'percentage' ? (
                          <span>{parseFloat(coupon.discountValue.toString())}%</span>
                        ) : (
                          <>
                            <IndianRupee className="h-3 w-3" />
                            <span>{parseFloat(coupon.discountValue.toString()).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        <span>{parseFloat(coupon.minAmount.toString()).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.maxAmount ? (
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          <span>{parseFloat(coupon.maxAmount.toString()).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unlimited</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                        <Clock className="h-3 w-3 ml-1" />
                        <span>{coupon.expiryTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {coupon.Agency ? (
                          <div>
                            <div className="font-medium">{coupon.Agency.name}</div>
                            <div className="text-xs text-muted-foreground">{coupon.Agency.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No Agency</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                          disabled={deleting === coupon.id}
                        />
                        <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                          disabled={deleting === coupon.id}
                        >
                          {deleting === coupon.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
