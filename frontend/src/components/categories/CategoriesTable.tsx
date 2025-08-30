import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit,
  Trash2,
  Tag,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useAllCategories, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories';
import { CategoryForm } from './CategoryForm';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export function CategoriesTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canManageData } = usePermissions();

  const { data: categories, isLoading } = useAllCategories();
  console.log('CategoriesTable: State:', { count: categories?.length, isLoading });
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();

  // Add timeout fallback - moved before any conditional returns
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Categories still loading after 10 seconds');
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await deleteCategory.mutateAsync(id);
        toast({
          title: 'Category deleted',
          description: `"${name}" has been deleted successfully.`,
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCategory.mutateAsync({
        id,
        updates: { is_active: !isActive }
      });
      toast({
        title: 'Category updated',
        description: `Category ${!isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const categoryIndex = filteredCategories.findIndex(c => c.id === id);
    const category = filteredCategories[categoryIndex];
    const targetIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1;
    const targetCategory = filteredCategories[targetIndex];

    if (!targetCategory) return;

    try {
      await Promise.all([
        updateCategory.mutateAsync({
          id: category.id,
          updates: { sort_order: targetCategory.sort_order }
        }),
        updateCategory.mutateAsync({
          id: targetCategory.id,
          updates: { sort_order: category.sort_order }
        })
      ]);
      
      toast({
        title: 'Category order updated',
        description: 'Categories have been reordered successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    console.log('CategoriesTable: Still loading...');
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-2 text-muted-foreground">Loading categories...</p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center text-lg md:text-xl">
            <Tag className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Categories
          </CardTitle>
          {canManageData && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-3 md:mx-auto">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <CategoryForm onSuccess={() => setShowAddDialog(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="hidden md:table-header-group">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 md:py-12">
                    <div className="text-muted-foreground text-sm md:text-base">
                      {searchTerm ? 'No categories match your search' : 'No categories found.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category, index) => (
                  <TableRow key={category.id} className="border-b md:table-row block mb-4 md:mb-0">
                    {/* Mobile Card Layout */}
                    <TableCell className="md:hidden p-4 block">
                      <div className="space-y-3">
                        {/* Category Name and Icon */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {category.icon && <span className="mr-2 text-lg">{category.icon}</span>}
                            <span className="font-medium text-base">{category.name}</span>
                          </div>
                          <Badge variant={category.is_active ? 'default' : 'secondary'} className="text-xs">
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        {/* Description */}
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                        
                        {/* Order and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-muted-foreground">Order: {category.sort_order}</span>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() => handleMove(category.id, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() => handleMove(category.id, 'down')}
                                disabled={index === filteredCategories.length - 1}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {canManageData && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent className="mx-3 md:mx-auto">
                                    <DialogHeader>
                                      <DialogTitle>Edit Category</DialogTitle>
                                    </DialogHeader>
                                    <CategoryForm 
                                      category={category}
                                      onSuccess={() => setEditingCategory(null)} 
                                    />
                                  </DialogContent>
                                </Dialog>
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(category.id, category.is_active)}
                                >
                                  {category.is_active ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(category.id, category.name)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Desktop Table Layout */}
                    <TableCell className="font-medium hidden md:table-cell">
                      <div className="flex items-center">
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {category.description ? (
                        <span className="text-sm text-muted-foreground">
                          {category.description}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{category.sort_order}</span>
                        <div className="flex flex-col space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleMove(category.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleMove(category.id, 'down')}
                            disabled={index === filteredCategories.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {canManageData ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Category</DialogTitle>
                                </DialogHeader>
                                <CategoryForm 
                                  category={category}
                                  onSuccess={() => setEditingCategory(null)} 
                                />
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(category.id, category.is_active)}
                            >
                              {category.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category.id, category.name)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-muted-foreground text-sm">View only</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}