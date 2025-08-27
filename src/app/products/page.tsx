
"use client";

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, AlertCircle } from 'lucide-react';
import { getProductsData } from '@/lib/data';
import type { Product } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { ProductDetailsDialog } from '@/components/product-details-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { useToast } from '@/hooks/use-toast';
import { AddProductDialog } from '@/components/add-product-dialog';

const PRODUCTS_STORAGE_KEY = 'gastrack-products';
const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedProducts = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        getProductsData().then(data => {
          setProducts(data);
          window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data));
        });
      }
    } catch (error) {
      console.error("Failed to load products from localStorage", error);
      getProductsData().then(setProducts);
    }
  }, [])

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);
  
  const updateProductsStateAndStorage = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
    } catch (error) {
      console.error("Failed to save products to localStorage", error);
    }
  };

  const handleShowDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    updateProductsStateAndStorage(newProducts);
    toast({
      title: 'Product Updated',
      description: `${updatedProduct.name} has been successfully updated.`,
    });
    setIsEditOpen(false);
    setSelectedProduct(null);
  }

  const handleProductAdd = (newProduct: Omit<Product, 'id'>) => {
    const productToAdd: Product = {
      ...newProduct,
      id: `prod_${Date.now()}`,
    };
    const newProducts = [...products, productToAdd];
    updateProductsStateAndStorage(newProducts);
    toast({
      title: 'Product Added',
      description: `${productToAdd.name} has been successfully added.`,
    });
    setIsAddOpen(false);
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product: Product) => {
                const isLowStock = product.stock < product.lowStockThreshold;
                return (
                  <TableRow key={product.id} onClick={() => handleShowDetails(product)} className="cursor-pointer">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>₹{product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{product.stock}</span>
                        {isLowStock && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Low
                          </Badge>
                        )}
                      </div>
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
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>Edit Price/Stock</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
