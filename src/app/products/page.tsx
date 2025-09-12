
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
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ProductDetailsDialog } from '@/components/product-details-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { useToast } from '@/hooks/use-toast';
import { AddProductDialog } from '@/components/add-product-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getProductsData } from '@/lib/data';

const ITEMS_PER_PAGE = 10;
const PRODUCTS_STORAGE_KEY = 'gastrack-products';

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateProductsState = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
    } catch (error) {
      console.error("Failed to save products to localStorage", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedProducts = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        const data = await getProductsData();
        updateProductsState(data);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch products.' });
      const data = await getProductsData();
      updateProductsState(data);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if(isClient) {
      fetchProducts();
    }
  }, [isClient, fetchProducts]);

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
    if (!selectedProduct) return;
    
    const newProducts = products.filter(p => p.id !== selectedProduct.id);
    updateProductsState(newProducts);
    
    toast({ title: 'Product Deleted', description: `${selectedProduct.productName} has been deleted.` });
    
    setIsDeleteOpen(false);
    setSelectedProduct(null);
  }

  const handleToggleStatus = async (productToToggle: Product) => {
    const newStatus = productToToggle.status === 'Active' ? 'Inactive' : 'Active';
    const newProducts = products.map(p => p.id === productToToggle.id ? {...p, status: newStatus} : p);
    updateProductsState(newProducts);
    toast({
        title: 'Product Status Updated',
        description: `${productToToggle.productName} is now ${newStatus}.`,
    });
  };

 const handleProductUpdate = async (updatedProduct: Product) => {
    const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    updateProductsState(newProducts);
    toast({ title: 'Product Updated', description: `${updatedProduct.productName} has been successfully updated.` });
    setIsEditOpen(false);
    setSelectedProduct(null);
    return true;
  }


  const handleProductAdd = async (newProduct: Omit<Product, 'id'>): Promise<boolean> => {
    const productToAdd: Product = {
      ...newProduct,
      id: `prod_${Date.now()}`
    }
    const newProducts = [...products, productToAdd];
    updateProductsState(newProducts);

    toast({ title: 'Product Added', description: `${newProduct.productName} has been successfully added.` });
    return true;
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
