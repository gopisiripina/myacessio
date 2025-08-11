import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, MoreHorizontal, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAssetCategories, useAssetLocations } from '@/hooks/useAssetCategories';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

const locationSchema = z.object({
  location_name: z.string().min(1, 'Location name is required'),
  department: z.string().optional(),
  floor: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type LocationFormData = z.infer<typeof locationSchema>;

export default function AssetCategoriesManagement() {
  const navigate = useNavigate();
  const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useAssetCategories();
  const { locations, createLocation, isLoading: locationsLoading } = useAssetLocations();
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'locations'>('categories');

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const locationForm = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      location_name: '',
      department: '',
      floor: '',
    },
  });

  const onSubmitCategory = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategory({ id: editingCategory.id, ...data } as any);
    } else {
      createCategory(data as any);
    }
    setIsCategoryDialogOpen(false);
    categoryForm.reset();
    setEditingCategory(null);
  };

  const onSubmitLocation = (data: LocationFormData) => {
    createLocation(data as any);
    setIsLocationDialogOpen(false);
    locationForm.reset();
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || '',
    });
    setIsCategoryDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/assets-dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Categories & Locations</h1>
          <p className="text-muted-foreground">
            Manage categories and locations for your assets
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
          Categories
        </Button>
        <Button
          variant={activeTab === 'locations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('locations')}
        >
          Locations
        </Button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Asset Categories</CardTitle>
              <p className="text-sm text-muted-foreground">
                Organize your assets by categories
              </p>
            </div>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCategory(null);
                  categoryForm.reset({ name: '', description: '' });
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
                            <Input placeholder="e.g., Laptops, Furniture" {...field} />
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
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCategoryDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
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
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No categories found. Create your first category!
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories?.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>
                          {new Date(category.created_at).toLocaleDateString()}
                        </TableCell>
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
                                onClick={() => deleteCategory(category.id)}
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

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Asset Locations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage physical locations for your assets
              </p>
            </div>
            <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => locationForm.reset()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Location</DialogTitle>
                </DialogHeader>
                <Form {...locationForm}>
                  <form onSubmit={locationForm.handleSubmit(onSubmitLocation)} className="space-y-4">
                    <FormField
                      control={locationForm.control}
                      name="location_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Office, Warehouse" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={locationForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., IT, Finance" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={locationForm.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Floor</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1st Floor, Ground Floor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsLocationDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {locationsLoading ? (
              <div>Loading locations...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No locations found. Create your first location!
                      </TableCell>
                    </TableRow>
                  ) : (
                    locations?.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.location_name}</TableCell>
                        <TableCell>{location.department || '-'}</TableCell>
                        <TableCell>{location.floor || '-'}</TableCell>
                        <TableCell>
                          {new Date(location.created_at).toLocaleDateString()}
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