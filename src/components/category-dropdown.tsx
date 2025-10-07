"use client";

import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

interface CategoryDropdownProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CategoryDropdown({ 
  value, 
  onValueChange, 
  placeholder = "Select category...",
  className,
  disabled = false
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { token } = useAuth();
  const { toast } = useToast();

  // Fetch categories from API
  const fetchCategories = useCallback(async (search = '') => {
    if (!token) return;
    
    setLoading(true);
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/categories`);
      url.searchParams.append('page', '1');
      url.searchParams.append('limit', '50');
      url.searchParams.append('status', 'active');
      
      if (search) {
        url.searchParams.append('search', search);
      }

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
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  // Create new category
  const createCategory = async () => {
    if (!newCategoryName.trim() || !token) return;
    
    setIsCreating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: "Category created successfully",
        });
        
        // Add new category to list
        const newCategory = result.data.category;
        setCategories(prev => [...prev, newCategory]);
        
        // Select the new category
        onValueChange(newCategory.id);
        
        // Reset form
        setNewCategoryName('');
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    if (!token) return;
    
    setIsDeleting(categoryId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        
        // Remove category from list
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        
        // If deleted category was selected, clear selection
        if (value === categoryId) {
          onValueChange('');
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Load categories on mount and when search changes
  useEffect(() => {
    fetchCategories(searchTerm);
  }, [fetchCategories, searchTerm]);

  // Find category by ID first, then by name (for backward compatibility)
  const selectedCategory = categories.find(category => 
    category.id === value || (value && category.name.toLowerCase() === value.toLowerCase())
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn("w-full justify-between", className)}
          >
            {selectedCategory ? selectedCategory.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search categories..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading..." : "No categories found."}
              </CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onValueChange(category.id); // Always return category ID
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          (value === category.id || value === category.name) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {category.name}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategory(category.id);
                      }}
                      disabled={isDeleting === category.id}
                    >
                      {isDeleting === category.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </CommandItem>
                ))}
                
                {/* Create new category button */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <CommandItem
                      onSelect={() => setIsCreateDialogOpen(true)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create new category
                    </CommandItem>
                  </DialogTrigger>
                </Dialog>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., LPG Gas, Accessories"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createCategory();
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewCategoryName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createCategory}
                disabled={!newCategoryName.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
