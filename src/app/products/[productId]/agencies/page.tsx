
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Mail, Phone, MapPin, Search } from 'lucide-react';
import type { Product, AgencyInventory } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProductAgenciesPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const filteredInventories = useMemo(() => {
    if (!product?.AgencyInventory) return [];
    return product.AgencyInventory.filter(inventory =>
      inventory.Agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [product, searchTerm]);


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
  
  const productImageUrl = product.images?.[0];

  return (
    <AppShell>
      <PageHeader title={product.productName}>
        <div className="flex items-center gap-4">
            {productImageUrl && (
                <div className="relative h-12 w-12 rounded-md overflow-hidden">
                    <Image src={productImageUrl} alt={product.productName} fill className="object-cover"/>
                </div>
            )}
            <div className="text-sm text-muted-foreground">{product.description}</div>
        </div>
      </PageHeader>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-tight">Agency Inventory</h2>
            <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search for an agency..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            {filteredInventories.length > 0 ? (
                filteredInventories.map((inventory: AgencyInventory) => (
                   <Card key={inventory.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary"/>
                                    {inventory.Agency.name}
                                </CardTitle>
                                 <Badge variant={inventory.Agency.status === 'active' ? 'secondary' : 'destructive'} className="capitalize">
                                    {inventory.Agency.status}
                                 </Badge>
                            </div>
                            <CardDescription>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2">
                                    <div className="flex items-center gap-1.5"><Mail className="h-3 w-3"/>{inventory.Agency.email}</div>
                                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3"/>{inventory.Agency.phone}</div>
                                    <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3"/>{inventory.Agency.city}</div>
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Variant</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                   {inventory.agencyVariants.map((variant, vIndex) => (
                                       <TableRow key={vIndex}>
                                           <TableCell>{variant.label}</TableCell>
                                           <TableCell className="text-right">₹{variant.price.toLocaleString()}</TableCell>
                                           <TableCell className="text-right">{variant.stock}</TableCell>
                                       </TableRow>
                                   ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                   </Card>
                ))
            ) : (
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="h-24 flex items-center justify-center">
                            <p className="text-muted-foreground">
                                {searchTerm ? `No agencies found matching "${searchTerm}".` : 'This product has not been assigned to any agencies yet.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      </div>
    </AppShell>
  );
}
