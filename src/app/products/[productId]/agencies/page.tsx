
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Package, MapPin } from 'lucide-react';
import type { Product, AgencyInventory } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Separator } from '@/components/ui/separator';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProductAgenciesPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token, handleApiError } = useAuth();

  const fetchProductData = useCallback(async () => {
    if (!token || !productId) return;
    setIsLoading(true);
    const url = `${API_BASE_URL}/api/products/${productId}?includeInventory=true`;
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
        setProduct(result.data.product);
      }
    } catch (error) {
      console.error("Failed to fetch product data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, productId, handleApiError]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Loading Product Inventory..." />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell>
        <PageHeader title="Product Not Found" />
        <Card>
          <CardContent className="pt-6">
            <p>The product you are looking for could not be found.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title={product.productName}>
        <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{product.description}</span>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary"/>
            Agency Inventory
          </CardTitle>
          <CardDescription>
            Stock levels and pricing for &quot;{product.productName}&quot; across all agencies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.AgencyInventory && product.AgencyInventory.length > 0 ? (
                product.AgencyInventory.map((inventory: AgencyInventory) => (
                    inventory.agencyVariants.map((variant, vIndex) => (
                        <TableRow key={`${inventory.id}-${vIndex}`}>
                            {vIndex === 0 && (
                                <TableCell rowSpan={inventory.agencyVariants.length} className="align-top font-medium">
                                    <div className="flex flex-col">
                                        <span>{inventory.Agency.name}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3"/>
                                            {inventory.Agency.city}
                                        </span>
                                    </div>
                                </TableCell>
                            )}
                            <TableCell>{variant.label}</TableCell>
                            <TableCell className="text-right">₹{variant.price.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{variant.stock}</TableCell>
                            {vIndex === 0 && (
                                <TableCell rowSpan={inventory.agencyVariants.length} className="align-top">
                                    <Badge variant={inventory.isActive ? 'secondary' : 'destructive'}>
                                        {inventory.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    This product has not been assigned to any agencies yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
