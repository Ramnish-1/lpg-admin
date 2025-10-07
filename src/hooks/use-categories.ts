import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/categories`);
      url.searchParams.append('page', '1');
      url.searchParams.append('limit', '100');
      url.searchParams.append('status', 'active');

      const response = await fetch(url.toString(), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const result = await response.json();
      if (result.success) {
        setCategories(result.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryName = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  }, [categories]);

  return {
    categories,
    loading,
    getCategoryName,
    refetch: fetchCategories
  };
}
