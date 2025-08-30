import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AssetLocation {
  id: string;
  location_name: string;
  department?: string;
  floor?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useAssetCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get asset categories
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .is('deleted_at', null)
        .order('name');
      
      if (error) throw error;
      return data as AssetCategory[];
    }
  });

  // Create category
  const createCategory = useMutation({
    mutationFn: async (newCategory: Omit<AssetCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('asset_categories')
        .insert({
          ...newCategory,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-categories'] });
      toast({
        title: "Category created successfully",
        description: "The asset category has been added."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update category
  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AssetCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('asset_categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-categories'] });
      toast({
        title: "Category updated successfully",
        description: "The asset category has been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete category
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('asset_categories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-categories'] });
      toast({
        title: "Category deleted successfully",
        description: "The asset category has been removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    categories,
    isLoading,
    error,
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending
  };
}

export function useAssetLocations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get asset locations
  const { data: locations, isLoading, error } = useQuery({
    queryKey: ['asset-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_locations')
        .select('*')
        .is('deleted_at', null)
        .order('location_name');
      
      if (error) throw error;
      return data as AssetLocation[];
    }
  });

  // Create location
  const createLocation = useMutation({
    mutationFn: async (newLocation: Omit<AssetLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('asset_locations')
        .insert({
          ...newLocation,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-locations'] });
      toast({
        title: "Location created successfully",
        description: "The asset location has been added."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating location",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    locations,
    isLoading,
    error,
    createLocation: createLocation.mutate,
    isCreating: createLocation.isPending
  };
}