
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, AlertCircle, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import { ProductDetailsDialog } from '@/components/product-details-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { useToast } from '@/hooks/use-toast';
import { AddProductDialog } from '@/components/add-product-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AuthContext, useAuth } from '@/context/auth-context';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) handleApiError(response);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data.products.map((p: any) => ({
          ...p,
          status: p.status.charAt(0).toUpperCase() + p.status.slice(1) // Capitalize status
        })));
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch products.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while fetching products.' });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast, handleApiError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);
  
  const handleShowDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) handleApiError(response);
      
      toast({ title: 'Product Deleted', description: `${selectedProduct.productName} has been deleted.` });
      fetchProducts(); // Re-fetch
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product.' });
    } finally {
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    }
  }

  const handleToggleStatus = async (productToToggle: Product) => {
    if (!token) return;
    const newStatus = productToToggle.status.toLowerCase() === 'active' ? 'inactive' : 'active';
    try {
       const response = await fetch(`${API_BASE_URL}/api/products/${productToToggle.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
            toast({
                title: 'Product Status Updated',
                description: `${productToToggle.productName} is now ${newStatus}.`,
            });
            fetchProducts();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

 const handleProductUpdate = async (updatedProduct: Product, imagesToDelete?: string[], newImages?: File[]): Promise<boolean> => {
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
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
            toast({ title: 'Product Updated', description: `${updatedProduct.productName} has been successfully updated.` });
            fetchProducts();
            return true;
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update product.' });
            return false;
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update product.' });
        return false;
    }
  }


  const handleProductAdd = async (newProduct: Omit<Product, 'id' | 'status'>, images: File[]): Promise<boolean> => {
    if (!token) return false;
    
    const formData = new FormData();
    formData.append('productName', newProduct.productName);
    formData.append('description', newProduct.description);
    formData.append('category', newProduct.category);
    formData.append('lowStockThreshold', String(newProduct.lowStockThreshold));
    formData.append('variants', JSON.stringify(newProduct.variants));
    if (newProduct.agencyIds) {
        formData.append('agencyIds', JSON.stringify(newProduct.agencyIds));
    }
    images.forEach(file => formData.append('images', file));

    try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
            toast({ title: 'Product Added', description: `${newProduct.productName} has been successfully added.` });
            fetchProducts();
            return true;
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to add product.' });
            return false;
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add product.' });
        return false;
    }
  }


  return (
    <AppShell>
      <PageHeader title="Product & Inventory">
        <Button size="sm" className="h-8 gap-1" onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Product
          </span>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage products, stock levels, and pricing.
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
                  <TableHead>Agency</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product: Product) => {
                  const totalStock = Array.isArray(product.variants) ? product.variants.reduce((sum, v) => sum + v.stock, 0) : 0;
                  const isLowStock = totalStock < product.lowStockThreshold;
                  return (
                    <TableRow 
                      key={product.id} 
                      className={cn({
                        "bg-red-100 hover:bg-red-100/80 dark:bg-red-900/20 dark:hover:bg-red-900/30": isLowStock
                      })}
                    >
                      <TableCell className="font-medium" onClick={() => handleShowDetails(product)}>{product.productName}</TableCell>
                      <TableCell onClick={() => handleShowDetails(product)}>
                        {product.agencies && product.agencies.length > 0
                          ? `${product.agencies.length} ${product.agencies.length === 1 ? 'Agency' : 'Agencies'}`
                          : <span className="text-muted-foreground">N/A</span>
                        }
                      </TableCell>
                      <TableCell onClick={() => handleShowDetails(product)}>
                        {product.variants && product.variants.length > 0 ? `${product.variants.length} variant(s)` : 'No variants'}
                      </TableCell>
                      <TableCell onClick={() => handleShowDetails(product)}>
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
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-28 justify-between capitalize" onClick={(e) => e.stopPropagation()}>
                                      <span className={cn({
                                          'text-green-600': product.status === 'Active',
                                          'text-gray-500': product.status === 'Inactive'
                                      })}>
                                          {product.status || 'N/A'}
                                      </span>
                                      <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                                      Set as {product.status === 'Active' ? 'Inactive' : 'Active'}
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
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
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProduct(product)}>
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
                Showing {paginatedProducts.length} of {products.length} products.
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
              This action cannot be undone. This will permanently delete the product
              &quot;{selectedProduct?.productName}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProductDetailsDialog
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      {selectedProduct && (
        <EditProductDialog
          product={selectedProduct}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          onProductUpdate={handleProductUpdate}
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

    