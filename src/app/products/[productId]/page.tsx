"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, ArrowLeft, Package, Settings, Trash2, Edit, Loader2 } from 'lucide-react';
import type { Product, AgencyInventory } from '@/lib/types';
import { useEffect, useState, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { ProfileContext } from '@/context/profile-context';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ImageViewerDialog } from '@/components/image-viewer-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ProductDetailPageProps {
  params: {
    productId: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isAgencyEditOpen, setIsAgencyEditOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<AgencyInventory | null>(null);
  const [editingVariants, setEditingVariants] = useState<any[]>([]);
  const [editingLowStockThreshold, setEditingLowStockThreshold] = useState(10);
  const [editingIsActive, setEditingIsActive] = useState(true);
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();
  const { profile } = useContext(ProfileContext);
  const router = useRouter();
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';

  const fetchProduct = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${params.productId}?includeInventory=true`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        setProduct(result.data.product);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch product details.' });
        router.push('/products');
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while fetching product details.' });
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Product detail page mounted with ID:', params.productId);
    fetchProduct();
  }, [params.productId, token]);

  const handleProductUpdate = async (updatedProduct: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images' | 'AgencyInventory'> & { id: string }, existingImages: string[] = [], imagesToDelete: string[] = [], newImages: File[] = []): Promise<boolean> => {
    if (!token || !isAdmin) return false;

    const formData = new FormData();
    formData.append('productName', updatedProduct.productName);
    formData.append('description', updatedProduct.description);
    formData.append('category', updatedProduct.category);
    formData.append('lowStockThreshold', String(updatedProduct.lowStockThreshold));
    formData.append('variants', JSON.stringify(updatedProduct.variants));
    formData.append('tags', JSON.stringify(updatedProduct.tags || []));
    
    if (existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }
    if (imagesToDelete && imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }
    if (newImages && newImages.length > 0) {
      newImages.forEach(file => {
        formData.append('images', file);
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast({ variant: 'destructive', title: 'Error', description: errorData.error || 'Failed to update product.' });
        return false;
      }
      
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Product Updated', description: `${updatedProduct.productName} has been successfully updated.` });
        fetchProduct();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update product.' });
        return false;
      }
    } catch (e) {
      console.error("Failed to update product:", e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update product.' });
      return false;
    }
  };

  const handleInventoryUpdate = async (inventoryData: any): Promise<boolean> => {
    if (!token || isAdmin || !product) return false;

    const { variants, lowStockThreshold } = inventoryData;
    
    const payload = {
      lowStockThreshold,
      agencyVariants: variants.map((v: any) => ({ label: v.label, price: v.price, stock: v.stock })),
      isActive: true,
    };
    
    const inventoryExists = product.AgencyInventory?.some(inv => inv.agencyId === profile.agencyId);
    const url = `${API_BASE_URL}/api/products/${product.id}/inventory/agency/${profile.agencyId}`;
    
    try {
      const response = await fetch(url, {
        method: inventoryExists ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({ variant: 'destructive', title: 'Error', description: errorData.error || 'Failed to update inventory.' });
        return false;
      }
      
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Inventory Updated', description: `Inventory for ${product.productName} has been updated.` });
        fetchProduct();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update inventory.' });
        return false;
      }
    } catch (e) {
      console.error("Failed to update inventory:", e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update inventory.' });
      return false;
    }
  };

  const handleAdminAgencyInventoryUpdate = async (agencyId: string, inventoryData: any): Promise<boolean> => {
    if (!token || !isAdmin || !product) return false;

    const payload = {
      agencyVariants: inventoryData.agencyVariants,
      lowStockThreshold: inventoryData.lowStockThreshold,
      isActive: inventoryData.isActive,
    };
    
    const url = `${API_BASE_URL}/api/products/${product.id}/inventory/agency/${agencyId}/admin-update`;
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({ variant: 'destructive', title: 'Error', description: errorData.error || 'Failed to update agency inventory.' });
        return false;
      }
      
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Agency Inventory Updated', description: `Agency inventory has been successfully updated.` });
        fetchProduct();
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update agency inventory.' });
        return false;
      }
    } catch (e) {
      console.error("Failed to update agency inventory:", e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update agency inventory.' });
      return false;
    }
  };

  const openAgencyEditDialog = (inventory: AgencyInventory) => {
    setEditingAgency(inventory);
    setEditingVariants([...inventory.agencyVariants]);
    setEditingLowStockThreshold(inventory.lowStockThreshold);
    setEditingIsActive(inventory.isActive);
    setIsAgencyEditOpen(true);
  };

  const handleAgencyEditSave = async () => {
    if (!editingAgency) return;

    const inventoryData = {
      agencyVariants: editingVariants,
      lowStockThreshold: editingLowStockThreshold,
      isActive: editingIsActive,
    };

    const success = await handleAdminAgencyInventoryUpdate(editingAgency.agencyId, inventoryData);
    if (success) {
      setIsAgencyEditOpen(false);
      setEditingAgency(null);
    }
  };

  const updateVariantStock = (index: number, value: number) => {
    const updatedVariants = [...editingVariants];
    updatedVariants[index] = { ...updatedVariants[index], stock: value };
    setEditingVariants(updatedVariants);
  };

  const confirmDelete = async () => {
    if (!product || !token || !isAdmin) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      
      toast({ title: 'Product Deleted', description: `The product has been deleted.` });
      router.push('/products');
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product.' });
    } finally {
      setIsDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-64">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </AppShell>
    );
  }

  const agencyInventory = !isAdmin 
    ? product.AgencyInventory?.find(inv => inv.agencyId === profile.agencyId)
    : null;
  
  const totalStock = isAdmin
    ? product.AgencyInventory?.reduce((sum, inv) => sum + inv.agencyVariants.reduce((s, v) => s + v.stock, 0), 0) ?? 0
    : agencyInventory?.agencyVariants.reduce((s, v) => s + (v.stock || 0), 0) ?? 0;
  
  const lowStockThreshold = isAdmin
    ? product.lowStockThreshold
    : agencyInventory?.lowStockThreshold ?? product.lowStockThreshold;

  const isLowStock = totalStock < lowStockThreshold;

  return (
    <AppShell>
      <PageHeader title={product.productName}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          {!isAdmin && (
            <Button onClick={() => setIsEditOpen(true)}>
              {!!agencyInventory ? (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Inventory
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Add to My Inventory
                </>
              )}
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6">
        {/* Product Images - Moved to top */}
        {product.images && product.images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.productName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{product.productName}</CardTitle>
                <CardDescription className="mt-2">{product.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                  {product.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stock Information */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Stock Information</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{totalStock}</span>
                  <span className="text-muted-foreground">units</span>
                  {isLowStock && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Low Stock
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Low stock threshold: {lowStockThreshold}
                </p>
              </div>

              {/* Product Details */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Product Details</h3>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-medium">Category:</span> {product.category}</p>
                  <p className="text-sm"><span className="font-medium">Status:</span> {product.status}</p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm"><span className="font-medium">Created:</span> {new Date(product.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm"><span className="font-medium">Updated:</span> {new Date(product.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Inventory Status */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Inventory Status</h3>
                {isAdmin ? (
                  <div className="space-y-1">
                    <p className="text-sm">Global Product</p>
                    <p className="text-sm text-muted-foreground">
                      Available in {product.AgencyInventory?.length || 0} agencies
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {agencyInventory ? (
                      <>
                        <p className="text-sm text-green-600">In My Inventory</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {agencyInventory.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-red-600">Not In My Inventory</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Product Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>Available variants and their details</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Unit</TableHead>
                  {isAdmin && <TableHead>Global Stock</TableHead>}
                  {!isAdmin && agencyInventory && <TableHead>My Stock</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.variants.map((variant, index) => {
                  const globalStock = isAdmin
                    ? product.AgencyInventory?.reduce((sum, inv) => {
                        const agencyVariant = inv.agencyVariants.find(v => v.label === variant.label);
                        return sum + (agencyVariant?.stock || 0);
                      }, 0) ?? 0
                    : agencyInventory?.agencyVariants.find(v => v.label === variant.label)?.stock || 0;

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{variant.label}</TableCell>
                      <TableCell>₹{variant.price}</TableCell>
                      <TableCell>{variant.unit}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{globalStock}</span>
                          {globalStock < lowStockThreshold && (
                            <Badge variant="destructive" className="text-xs">
                              Low
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Agency Inventory (Admin only) */}
        {isAdmin && product.AgencyInventory && product.AgencyInventory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Agency Inventory</CardTitle>
              <CardDescription>Inventory distribution across agencies</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Stock</TableHead>
                    <TableHead>Low Stock Threshold</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.AgencyInventory.map((inventory) => {
                    const totalAgencyStock = inventory.agencyVariants.reduce((sum, v) => sum + v.stock, 0);
                    const isAgencyLowStock = totalAgencyStock < inventory.lowStockThreshold;

                    return (
                      <TableRow key={inventory.id}>
                        <TableCell className="font-medium">
                          {inventory.Agency?.name || 'Unknown Agency'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">Email:</span> {inventory.Agency?.email || 'N/A'}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Phone:</span> {inventory.Agency?.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={inventory.isActive ? 'default' : 'secondary'}>
                            {inventory.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{totalAgencyStock}</span>
                            {isAgencyLowStock && (
                              <Badge variant="destructive" className="text-xs">
                                Low
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{inventory.lowStockThreshold}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAgencyEditDialog(inventory)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      {product && (
        <EditProductDialog
          item={product}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          onProductUpdate={handleProductUpdate}
          onInventoryUpdate={handleInventoryUpdate}
          isAdmin={isAdmin}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this product from the global catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Agency Edit Dialog */}
      <Dialog open={isAgencyEditOpen} onOpenChange={setIsAgencyEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Agency Inventory</DialogTitle>
            <DialogDescription>
              Update inventory details for {editingAgency?.Agency?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Agency Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Agency Variants</h3>
              {editingVariants.map((variant, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`variant-${index}-label`}>Variant</Label>
                    <Input
                      id={`variant-${index}-label`}
                      value={variant.label}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variant-${index}-price`}>Price (₹)</Label>
                    <Input
                      id={`variant-${index}-price`}
                      type="number"
                      value={variant.price}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variant-${index}-stock`}>Stock</Label>
                    <Input
                      id={`variant-${index}-stock`}
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariantStock(index, Number(e.target.value))}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Low Stock Threshold */}
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={editingLowStockThreshold}
                onChange={(e) => setEditingLowStockThreshold(Number(e.target.value))}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={editingIsActive}
                onCheckedChange={setEditingIsActive}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAgencyEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAgencyEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer */}
      {selectedImageIndex !== null && product.images && (
        <ImageViewerDialog
          imageUrl={product.images[selectedImageIndex]}
          isOpen={selectedImageIndex !== null}
          onOpenChange={() => setSelectedImageIndex(null)}
        />
      )}
    </AppShell>
  );
}
