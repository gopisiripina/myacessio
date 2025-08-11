import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, ArrowLeft, Tag, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useVendors } from '@/hooks/useVendors';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
});

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  website: z.string().optional(),
  support_email: z.string().email().optional().or(z.literal('')),
  support_phone: z.string().optional(),
  notes: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type VendorFormData = z.infer<typeof vendorSchema>;

export default function SubscriptionCategoriesManagement() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'vendors'>('categories');

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      color: '',
      is_active: true,
      sort_order: 0,
    },
  });

  const vendorForm = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      website: '',
      support_email: '',
      support_phone: '',
      notes: '',
    },
  });

  const onSubmitCategory = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          updates: data
        });
      } else {
        await createCategory.mutateAsync(data as any);
      }
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const onSubmitVendor = async (data: VendorFormData) => {
    try {
      // Note: Vendor creation/update logic would go here
      // For now, just close the dialog
      setIsVendorDialogOpen(false);
      vendorForm.reset();
      setEditingVendor(null);
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '',
      is_active: category.is_active ?? true,
      sort_order: category.sort_order || 0,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory.mutateAsync(categoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/subscriptions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subscription Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Categories Management</h1>
          <p className="text-muted-foreground">
            Organize and manage subscription service categories and vendors
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        <Button
          variant={activeTab === 'categories' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('categories')}
        >
          <Tag className="mr-2 h-4 w-4" />
          Categories
        </Button>
        <Button
          variant={activeTab === 'vendors' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('vendors')}
        >
          <Users className="mr-2 h-4 w-4" />
          Vendors
        </Button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Service Categories</CardTitle>
              <p className="text-sm text-muted-foreground">
                Organize your subscription services by categories
              </p>
            </div>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCategory(null);
                  categoryForm.reset({ 
                    name: '', 
                    description: '', 
                    icon: '', 
                    color: '', 
                    is_active: true, 
                    sort_order: 0 
                  });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Software, Cloud Services" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Category description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryForm.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., laptop, cloud" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., #3B82F6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={categoryForm.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Enable this category
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="sort_order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sort Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCategoryDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                        {editingCategory ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading categories...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No categories found. Create your first category!
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories?.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>{category.icon || '-'}</TableCell>
                        <TableCell>
                          {category.color && (
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded border" 
                                style={{ backgroundColor: category.color }}
                              />
                              <span>{category.color}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            category.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>{category.sort_order}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCategory(category.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Service Vendors</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage subscription service providers and vendors
              </p>
            </div>
            <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingVendor(null);
                  vendorForm.reset();
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingVendor ? 'Edit Vendor' : 'Create New Vendor'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...vendorForm}>
                  <form onSubmit={vendorForm.handleSubmit(onSubmitVendor)} className="space-y-4">
                    <FormField
                      control={vendorForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Microsoft, Google, Adobe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="support_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Email</FormLabel>
                          <FormControl>
                            <Input placeholder="support@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="support_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vendorForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes about the vendor..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsVendorDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingVendor ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {vendorsLoading ? (
              <div>Loading vendors...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Support Email</TableHead>
                    <TableHead>Support Phone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No vendors found. Create your first vendor!
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendors?.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>
                          {vendor.website ? (
                            <a 
                              href={vendor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {vendor.website}
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{vendor.support_email || '-'}</TableCell>
                        <TableCell>{vendor.support_phone || '-'}</TableCell>
                        <TableCell>
                          {new Date(vendor.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}