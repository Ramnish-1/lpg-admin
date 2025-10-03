'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSocket } from '@/context/socket-context';
import { useToast } from '@/hooks/use-toast';
import socketService, { SocketEventData, InventoryEventData, ProductEventData } from '@/lib/socket';

interface InventoryItem extends InventoryEventData {
  lastUpdated?: string;
}

interface InventorySocketHook {
  inventory: InventoryItem[];
  products: ProductEventData[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (productId: string, agencyId: string, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (productId: string, agencyId: string) => void;
  addProduct: (product: ProductEventData) => void;
  updateProduct: (productId: string, updates: Partial<ProductEventData>) => void;
  clearInventory: () => void;
  clearProducts: () => void;
}

export const useSocketInventory = (): InventorySocketHook => {
  const { isConnected } = useSocket();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<ProductEventData[]>([]);

  const addInventoryItem = useCallback((item: InventoryItem) => {
    setInventory(prev => {
      const exists = prev.find(i => i.productId === item.productId && i.agencyId === item.agencyId);
      if (exists) {
        return prev.map(i => 
          i.productId === item.productId && i.agencyId === item.agencyId 
            ? { ...i, ...item, lastUpdated: new Date().toISOString() }
            : i
        );
      }
      return [...prev, { ...item, lastUpdated: new Date().toISOString() }];
    });
  }, []);

  const updateInventoryItem = useCallback((productId: string, agencyId: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => 
      item.productId === productId && item.agencyId === agencyId
        ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
        : item
    ));
  }, []);

  const removeInventoryItem = useCallback((productId: string, agencyId: string) => {
    setInventory(prev => prev.filter(item => 
      !(item.productId === productId && item.agencyId === agencyId)
    ));
  }, []);

  const addProduct = useCallback((product: ProductEventData) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? { ...p, ...product } : p);
      }
      return [product, ...prev];
    });
  }, []);

  const updateProduct = useCallback((productId: string, updates: Partial<ProductEventData>) => {
    setProducts(prev => prev.map(product => 
      product.id === productId ? { ...product, ...updates } : product
    ));
  }, []);

  const clearInventory = useCallback(() => {
    setInventory([]);
  }, []);

  const clearProducts = useCallback(() => {
    setProducts([]);
  }, []);

  // Product Created Handler
  const handleProductCreated = useCallback((data: SocketEventData) => {
    const product = data.data as ProductEventData;
    console.log('🆕 New Product Created:', product);
    
    addProduct(product);
    
    toast({
      title: "New Product Created",
      description: `Product "${product.productName}" has been created`,
      variant: "default",
    });
  }, [addProduct, toast]);

  // Product Updated Handler
  const handleProductUpdated = useCallback((data: SocketEventData) => {
    const product = data.data as ProductEventData;
    console.log('📝 Product Updated:', product);
    
    updateProduct(product.id, product);
    
    toast({
      title: "Product Updated",
      description: `Product "${product.productName}" has been updated`,
      variant: "default",
    });
  }, [updateProduct, toast]);

  // Inventory Updated Handler
  const handleInventoryUpdated = useCallback((data: SocketEventData) => {
    const inventory = data.data as InventoryEventData;
    console.log('📦 Inventory Updated:', inventory);
    
    switch (inventory.action) {
      case 'added':
        addInventoryItem(inventory);
        toast({
          title: "Product Added to Inventory",
          description: `${inventory.productName} added to ${inventory.agencyName}`,
          variant: "default",
        });
        break;
      
      case 'updated':
        updateInventoryItem(inventory.productId, inventory.agencyId, inventory);
        toast({
          title: "Inventory Updated",
          description: `${inventory.productName} stock updated: ${inventory.stock} units`,
          variant: "default",
        });
        break;
      
      case 'removed':
        removeInventoryItem(inventory.productId, inventory.agencyId);
        toast({
          title: "Product Removed",
          description: `${inventory.productName} removed from ${inventory.agencyName}`,
          variant: "destructive",
        });
        break;
      
      default:
        updateInventoryItem(inventory.productId, inventory.agencyId, inventory);
    }
  }, [addInventoryItem, updateInventoryItem, removeInventoryItem, toast]);

  // Low Stock Alert Handler
  const handleLowStock = useCallback((data: SocketEventData) => {
    const alert = data.data as InventoryEventData;
    console.log('⚠️ LOW STOCK ALERT:', alert);
    
    // Update inventory item to reflect low stock
    updateInventoryItem(alert.productId, alert.agencyId, alert);
    
    toast({
      title: "🚨 LOW STOCK ALERT",
      description: `${alert.productName} at ${alert.agencyName}: Only ${alert.stock} units left!`,
      variant: "destructive",
      duration: 8000, // Show longer for urgent alerts
    });
  }, [updateInventoryItem, toast]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to product events
    socketService.onProductCreated(handleProductCreated);
    socketService.onProductUpdated(handleProductUpdated);
    
    // Subscribe to inventory events
    socketService.onInventoryUpdated(handleInventoryUpdated);
    socketService.onLowStock(handleLowStock);

    // Cleanup on unmount
    return () => {
      socketService.offProductCreated(handleProductCreated);
      socketService.offProductUpdated(handleProductUpdated);
      socketService.offInventoryUpdated(handleInventoryUpdated);
      socketService.offLowStock(handleLowStock);
    };
  }, [isConnected, handleProductCreated, handleProductUpdated, handleInventoryUpdated, handleLowStock]);

  return {
    inventory,
    products,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    addProduct,
    updateProduct,
    clearInventory,
    clearProducts,
  };
};
