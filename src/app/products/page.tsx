
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, AlertCircle, Loader2, Trash2, Building } from 'lucide-react';
import type { Product, Agency, AgencyInventory } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import { ProductDetailsDialog } from '@/components/product-details-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { useToast } from '@/hooks/use-toast';
import { AddProductDialog } from '@/components/add-product-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/auth-context';
import { ProfileContext } from '@/context/profile-context';
import { AgencyListDialog } from '@/components/agency-list-dialog';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [agencyInventories, setAgencyInventories] = useState<AgencyInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Product | AgencyInventory | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAgencyListOpen, setIsAgencyListOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();
  const { profile } = useContext(ProfileContext);
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    const url = isAdmin 
      ? `${API_BASE_URL}/api/products` 
      : `${API_BASE_URL}/api/products/inventory/agency/${profile.agencyId}`;
      
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
        if (isAdmin) {
          setProducts(result.data.products || []);
        } else {
          setAgencyInventories(result.data.inventories || []);
        }
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch data.' });
      }
    } catch (error) {
       console.error("Failed to fetch data:", error);
       toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while fetching data.' });
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, profile.agencyId, toast, handleApiError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const items = isAdmin ? products : agencyInventories;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage]);
  
  const handleShowDetails = (item: Product | AgencyInventory) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };
  
  const handleEdit = (item: Product | AgencyInventory) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };
  
  const handleDelete = (item: Product | AgencyInventory) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleShowAgencies = (product: Product) => {
    setSelectedItem(product);
    setIsAgencyListOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem || !token) return;
    
    const isGlobalProduct = 'productName' in selectedItem;
    const url = isGlobalProduct
      ? `${API_BASE_URL}/api/products/${selectedItem.id}`
      : `${API_BASE_URL}/api/products/${(selectedItem as AgencyInventory).productId}/inventory/agency/${profile.agencyId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      
      toast({ title: 'Item Deleted', description: `The item has been deleted.` });
      fetchData();
    } catch (error) {
       console.error("Failed to delete item:", error);
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete item.' });
    } finally {
      setIsDeleteOpen(false);
      setSelectedItem(null);
    }
  }

 const handleProductUpdate = async (updatedProduct: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images' | 'AgencyInventory'> & { id: string }, imagesToDelete?: string[], newImages?: File[]): Promise<boolean> => {
    if(!token) return false;

    const formData = new FormData();
    formData.append('productName', updatedProduct.productName);
    formData.append('description', updatedProduct.description);
    formData.append('category', updatedProduct.category);
    formData.append('lowStockThreshold', String(updatedProduct.lowStockThreshold));
    formData.append('variants', JSON.stringify(updatedProduct.variants));
    
    if (imagesToDelete && imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }
    if (newImages) {
        newImages.forEach(file => formData.append('images', file));
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${updatedProduct.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
            body: formData,
        });
        if (!response.ok) {
          handleApiError(response);
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


  const handleProductAdd = async (newProduct: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images' | 'AgencyInventory'>, images: File[]): Promise<boolean> => {
    if (!token) return false;
    
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
          handleApiError(response);
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
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add product.' });
        return false;
    }
  }

  const handleToggleProductStatus = async (productToToggle: Product) => {
    if (!token || !isAdmin) return;
    const newStatus = productToToggle.status.toLowerCase() === 'active' ? 'inactive' : 'active';
    try {
       const response = await fetch(`${API_BASE_URL}/api/products/${productToToggle.id}`, {
            method: 'PUT',
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
                title: 'Product Status Updated',
                description: `${productToToggle.productName} is now ${newStatus}.`,
            });
            fetchData();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
        }
    } catch(e) {
        console.error("Failed to toggle product status:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };


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
            <CardTitle>{isAdmin ? 'Global Product Catalog' : 'My Agency Inventory'}</CardTitle>
            <CardDescription>
                {isAdmin ? 'Manage all products available in the system.' : 'Manage stock and pricing for products in your agency.'}
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
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => {
                  const product = 'productName' in item ? item : item.Product;
                  const inventory = 'agencyId' in item ? item : null;
                  
                  const totalStock = inventory 
                    ? inventory.stock
                    : product.AgencyInventory?.reduce((sum, inv) => sum + inv.stock, 0) ?? 0;
                  
                  const isLowStock = inventory 
                    ? inventory.stock < inventory.lowStockThreshold
                    : totalStock < product.lowStockThreshold;

                  return (
                    <TableRow 
                      key={product.id + (inventory?.agencyId || '')} 
                      className={cn("cursor-pointer", {
                        "bg-red-100 hover:bg-red-100/80 dark:bg-red-900/20 dark:hover:bg-red-900/30": isLowStock
                      })}
                      onClick={() => handleShowDetails(item)}
                    >
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{totalStock}</span>
                          {isLowStock && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Low
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                          <Badge variant={product.status === 'Active' ? 'secondary' : 'outline'}>
                            {product.status}
                          </Badge>
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
                            <DropdownMenuItem onClick={() => handleShowDetails(item)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>Edit {isAdmin ? 'Product' : 'Inventory'}</DropdownMenuItem>
                            {isAdmin && (
                               <DropdownMenuItem onClick={() => handleShowAgencies(product)}>
                                <Building className="mr-2 h-4 w-4" />
                                View in Agencies
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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
                Showing {paginatedItems.length} of {items.length} items.
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
              This action cannot be undone. This will permanently delete this item.
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
          onInventoryUpdate={() => {}} // Placeholder
          isAdmin={isAdmin}
        />
      )}
       <AddProductDialog
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        onProductAdd={handleProductAdd}
      />
      <AgencyListDialog
        agencies={(selectedItem as Product)?.AgencyInventory?.map(inv => inv.Agency!)}
        productName={(selectedItem as Product)?.productName}
        isOpen={isAgencyListOpen}
        onOpenChange={setIsAgencyListOpen}
      />
    </AppShell>
  );
}
