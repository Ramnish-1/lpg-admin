

"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, AlertCircle, Loader2, Trash2, Settings, PackagePlus, ChevronDown } from 'lucide-react';
import type { Product, AgencyInventory } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import { ProductDetailsDialog } from '@/components/product-details-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { useToast } from '@/hooks/use-toast';
import { AddProductDialog } from '@/components/add-product-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/auth-context';
import { ProfileContext } from '@/context/profile-context';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();
  const { profile } = useContext(ProfileContext);
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    const url = `${API_BASE_URL}/api/products?includeInventory=true`;
      
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setProducts(result.data.products || []);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch data.' });
      }
    } catch (error) {
       console.error("Failed to fetch data:", error);
       toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while fetching data.' });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast, handleApiError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);
  
  const handleShowDetails = (item: Product) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };
  
  const handleEdit = (item: Product) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };
  
  const handleDelete = (item: Product) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleManageInventory = (product: Product) => {
    setSelectedItem(product);
    setIsEditOpen(true);
  }

  const confirmDelete = async () => {
    if (!selectedItem || !token) return;
    if (!isAdmin) return;

    const url = `${API_BASE_URL}/api/products/${selectedItem.id}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      
      toast({ title: 'Product Deleted', description: `The product has been deleted.` });
      fetchData();
    } catch (error) {
       console.error("Failed to delete item:", error);
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product.' });
    } finally {
      setIsDeleteOpen(false);
      setSelectedItem(null);
    }
  }

 const handleProductUpdate = async (updatedProduct: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images' | 'AgencyInventory'> & { id: string }, imagesToDelete?: string[], newImages?: File[]): Promise<boolean> => {
    if(!token || !isAdmin) return false;

    const formData = new FormData();
    formData.append('productName', updatedProduct.productName);
    formData.append('description', updatedProduct.description);
    formData.append('category', updatedProduct.category);
    formData.append('lowStockThreshold', String(updatedProduct.lowStockThreshold));
    formData.append('variants', JSON.stringify(updatedProduct.variants));
    
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
            fetchData();
            return true;
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update product.' });
            return false;
        }
    } catch(e) {
        console.error("Failed to update product:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update product.' });
        return false;
    }
  }

  const handleInventoryUpdate = async (inventoryData: any): Promise<boolean> => {
    if (!token || isAdmin || !selectedItem) return false;

    const { variants, lowStockThreshold } = inventoryData;
    
    const payload = {
      lowStockThreshold,
      agencyVariants: variants.map((v: any) => ({ label: v.label, price: v.price, stock: v.stock })),
      isActive: true,
    };
    
    const inventoryExists = selectedItem.AgencyInventory?.some(inv => inv.agencyId === profile.agencyId);
    const url = `${API_BASE_URL}/api/products/${selectedItem.id}/inventory/agency/${profile.agencyId}`;
    
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
        toast({ title: 'Inventory Updated', description: `Inventory for ${selectedItem.productName} has been updated.` });
        fetchData();
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
  }

  const handleProductAdd = async (newProduct: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images' | 'AgencyInventory'>, images: File[]): Promise<boolean> => {
    if (!token || !isAdmin) return false;
    
    const formData = new FormData();
    formData.append('productName', newProduct.productName);
    formData.append('description', newProduct.description);
    formData.append('category', newProduct.category);
    formData.append('lowStockThreshold', String(newProduct.lowStockThreshold));
    formData.append('variants', JSON.stringify(newProduct.variants));
    images.forEach(file => formData.append('images', file));

    try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast({ variant: 'destructive', title: 'Error adding product', description: errorData.error || 'An unknown error occurred.' });
          return false;
        }

        const result = await response.json();
        if (result.success) {
            toast({ title: 'Product Added', description: `${newProduct.productName} has been successfully added.` });
            fetchData();
            return true;
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to add product.' });
            return false;
        }
    } catch(e) {
        console.error("Failed to add product:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while adding the product.' });
        return false;
    }
  }
  
  const handleToggleStatus = async (product: Product, newStatus: 'active' | 'inactive') => {
    if (!token || !isAdmin) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        handleApiError(response);
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        toast({
            title: 'Status Updated',
            description: `${product.productName}'s status is now ${newStatus}.`,
        });
        fetchData();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
      }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const handleToggleInventoryStatus = async (product: Product, inventory: AgencyInventory) => {
    if (!token || !inventory || isAdmin) return;

    const newStatus = !inventory.isActive;

    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/inventory/agency/${inventory.agencyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ isActive: newStatus })
        });
        if (!response.ok) {
            handleApiError(response);
            return;
        }
        const result = await response.json();
        if (result.success) {
            toast({ title: 'Inventory Status Updated', description: `${product.productName} is now ${newStatus ? 'active' : 'inactive'} in your inventory.` });
            fetchData();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update inventory status.' });
        }
    } catch (e) {
        console.error("Failed to update inventory status:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update inventory status.' });
    }
  }

  return (
    <AppShell>
      <PageHeader title="Product & Inventory">
        {isAdmin && (
          <Button size="sm" className="h-8 gap-1" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Product
            </span>
          </Button>
        )}
      </PageHeader>
      <Card>
        <CardHeader>
            <CardTitle>{isAdmin ? 'Global Product Catalog' : 'Available Products'}</CardTitle>
            <CardDescription>
                {isAdmin ? 'Manage all products available in the system.' : 'View all available products and manage your agency inventory.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>{isAdmin ? 'Global Stock' : 'My Stock'}</TableHead>
                  <TableHead>Product Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((product) => {
                  
                  const agencyInventory = !isAdmin 
                    ? product.AgencyInventory?.find(inv => inv.agencyId === profile.agencyId)
                    : null;
                  
                  const totalStock = isAdmin
                    ? product.AgencyInventory?.reduce((sum, inv) => sum + inv.agencyVariants.reduce((s, v) => s + v.stock, 0), 0) ?? 0
                    : agencyInventory?.agencyVariants.reduce((s, v) => s + v.stock, 0) ?? 0;
                  
                  const lowStockThreshold = isAdmin
                    ? product.lowStockThreshold
                    : agencyInventory?.lowStockThreshold ?? product.lowStockThreshold;

                  const isLowStock = totalStock < lowStockThreshold;

                  return (
                    <TableRow 
                      key={product.id} 
                      className={cn("cursor-pointer", {
                        "bg-red-100 hover:bg-red-100/80 dark:bg-red-900/20 dark:hover:bg-red-900/30": isLowStock && (isAdmin || !!agencyInventory)
                      })}
                      onClick={() => handleShowDetails(product)}
                    >
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{totalStock}</span>
                          {isLowStock && (isAdmin || !!agencyInventory) && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Low
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                           {isAdmin ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm" className={cn("w-28 justify-between capitalize", { 
                                          'bg-destructive text-destructive-foreground hover:bg-destructive/90': product.status === 'inactive',
                                          'bg-green-600 text-white hover:bg-green-600/90': product.status === 'active'
                                        })}>
                                            <span>
                                                {product.status}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuRadioGroup 
                                            value={product.status} 
                                            onValueChange={(newStatus) => handleToggleStatus(product, newStatus as 'active' | 'inactive')}
                                        >
                                            <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="inactive" className="text-destructive">Inactive</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                           ) : (
                                <div>
                                  {agencyInventory ? (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-28 justify-between capitalize">
                                            <span className={cn({
                                                'text-green-600': agencyInventory.isActive,
                                                'text-gray-500': !agencyInventory.isActive
                                            })}>
                                                {agencyInventory.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="start">
                                        <DropdownMenuItem onClick={() => handleToggleInventoryStatus(product, agencyInventory)}>
                                          Set as {agencyInventory.isActive ? 'Inactive' : 'Active'}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  ) : (
                                    <Badge variant='outline'>Not In Inventory</Badge>
                                  )}
                                   <p className={cn('text-xs mt-1', agencyInventory ? 'text-green-600' : 'text-red-600')}>
                                        {agencyInventory ? 'In My Inventory' : 'Not In My Inventory'}
                                    </p>
                                </div>
                           )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShowDetails(product)}>View Details</DropdownMenuItem>
                            {isAdmin ? (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(product)}>Edit Product</DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link href={`/products/${product.id}/agencies`} className="w-full">
                                    View in Agencies
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            ) : (
                               <DropdownMenuItem onClick={() => handleManageInventory(product)}>
                                {!!agencyInventory ? <Settings className="mr-2 h-4 w-4" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                                {!!agencyInventory ? 'Manage Inventory' : 'Add to My Inventory'}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                Showing {paginatedItems.length} of {products.length} items.
                </div>
                <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <span className="text-sm">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
                </div>
            </CardFooter>
        )}
      </Card>

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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProductDetailsDialog
        item={selectedItem}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        isAdmin={isAdmin}
      />
      {selectedItem && (
        <EditProductDialog
          item={selectedItem}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          onProductUpdate={handleProductUpdate}
          onInventoryUpdate={handleInventoryUpdate}
          isAdmin={isAdmin}
        />
      )}
       <AddProductDialog
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        onProductAdd={handleProductAdd}
      />
    </AppShell>
  );
}

    

    

