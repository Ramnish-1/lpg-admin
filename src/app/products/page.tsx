
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, AlertCircle, ChevronDown, Loader2, Trash2, Filter } from 'lucide-react';
import type { Product, Agency } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import { ProductDetailsDialog } from '@/components/product-details-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { useToast } from '@/hooks/use-toast';
import { AddProductDialog } from '@/components/add-product-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/auth-context';
import { ProfileContext } from '@/context/profile-context';

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgency, setSelectedAgency] = useState('all');
  const { toast } = useToast();
  const { token, handleApiError } = useAuth();
  const { profile } = useContext(ProfileContext);
  const isAdmin = profile.role === 'admin';

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) {
        handleApiError(response);
        return;
      }
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
       console.error("Failed to fetch products:", error);
       toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while fetching products.' });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast, handleApiError]);

  const fetchAgencies = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies/active`, {
         headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
       if (!response.ok) {
        handleApiError(response);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setAgencies(result.data.agencies);
      }
    } catch (error) {
      console.error("Failed to fetch agencies:", error);
    }
  }, [token, isAdmin, handleApiError]);

  useEffect(() => {
    fetchProducts();
    fetchAgencies();
  }, [fetchProducts, fetchAgencies]);
  
  const filteredProducts = useMemo(() => {
    if (selectedAgency === 'all') {
      return products;
    }
    return products.filter(p => p.Agency?.id === selectedAgency);
  }, [products, selectedAgency]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);
  
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
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) {
        handleApiError(response);
        return;
      }
      
      toast({ title: 'Product Deleted', description: `${selectedProduct.productName} has been deleted.` });
      fetchProducts(); // Re-fetch
    } catch (error) {
       console.error("Failed to delete product:", error);
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product.' });
    } finally {
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    }
  }

  const handleToggleProductStatus = async (productToToggle: Product) => {
    if (!token) return;
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
            fetchProducts();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
        }
    } catch(e) {
        console.error("Failed to toggle product status:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

 const handleProductUpdate = async (updatedProduct: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images'> & { id: string }, imagesToDelete?: string[], newImages?: File[]): Promise<boolean> => {
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
            fetchProducts();
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


  const handleProductAdd = async (newProduct: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images'>, images: File[]): Promise<boolean> => {
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
            fetchProducts();
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

  const handleToggleAgencyStatus = async (agency: Agency, newStatus: 'active' | 'inactive') => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/agencies/${agency.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      if (!response.ok) {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
        return;
      }
      
      if (result.success) {
        toast({
            title: 'Agency Status Updated',
            description: `${agency.name}'s status is now ${newStatus}.`,
        });
        fetchProducts();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update status.' });
      }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };


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
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                    Manage products, stock levels, and pricing.
                </CardDescription>
            </div>
            {isAdmin && agencies.length > 0 && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                           <Filter className="h-4 w-4"/>
                           <span>Filter by Agency</span>
                           <ChevronDown className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={selectedAgency} onValueChange={setSelectedAgency}>
                            <DropdownMenuRadioItem value="all">All Agencies</DropdownMenuRadioItem>
                            {agencies.map(agency => (
                                <DropdownMenuRadioItem key={agency.id} value={agency.id}>{agency.name}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
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
                  {isAdmin && <TableHead>Agency</TableHead>}
                  <TableHead>Variants</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Product Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product: Product) => {
                  const safeVariants = Array.isArray(product.variants) ? product.variants : [];
                  const totalStock = safeVariants.reduce((sum, v) => sum + v.stock, 0);
                  const isLowStock = totalStock < product.lowStockThreshold;
                  return (
                    <TableRow 
                      key={product.id} 
                      className={cn("cursor-pointer", {
                        "bg-red-100 hover:bg-red-100/80 dark:bg-red-900/20 dark:hover:bg-red-900/30": isLowStock
                      })}
                      onClick={() => handleShowDetails(product)}
                    >
                      <TableCell className="font-medium">{product.productName}</TableCell>
                       {isAdmin && (
                        <TableCell>
                          {product.Agency ? (
                             <div className="text-xs">
                                <div className="font-semibold">{product.Agency.name}</div>
                                <div className="text-muted-foreground">{product.Agency.city}</div>
                                <div className="text-muted-foreground">{product.Agency.email}</div>
                                <div className="text-muted-foreground">{product.Agency.phone}</div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-24 justify-between capitalize mt-2 h-7 rounded-full px-3" onClick={(e) => e.stopPropagation()}>
                                        <span className={cn({
                                            'text-green-600': product.Agency.status === 'active',
                                            'text-destructive': product.Agency.status === 'inactive'
                                        })}>
                                            {product.Agency.status}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem 
                                      onClick={() => handleToggleAgencyStatus(product.Agency!, 'active')}
                                      disabled={product.Agency.status === 'active'}
                                    >
                                        Set as Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleToggleAgencyStatus(product.Agency!, 'inactive')}
                                      disabled={product.Agency.status === 'inactive'}
                                      className="text-destructive"
                                    >
                                        Set as Inactive
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {safeVariants.length > 0 ? `${safeVariants.length} variant(s)` : 'No variants'}
                      </TableCell>
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
                                  <DropdownMenuItem onClick={() => handleToggleProductStatus(product)}>
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
                Showing {paginatedProducts.length} of {filteredProducts.length} products.
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
