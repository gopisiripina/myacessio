import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  description?: string;
  asset_category_id?: string;
  condition: 'new' | 'used' | 'refurbished' | 'damaged';
  status: 'in_use' | 'available' | 'maintenance' | 'disposed' | 'lost';
  assigned_to_user?: string;
  assigned_to_department?: string;
  location_id?: string;
  purchase_cost: number;
  current_book_value: number;
  model_number?: string;
  serial_number?: string;
  sub_category?: string;
  qr_code_url?: string;
  end_of_life?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  asset_categories?: { name: string };
  asset_locations?: { location_name: string };
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
}

export interface AssetLocation {
  id: string;
  location_name: string;
  department?: string;
  floor?: string;
  user_id: string;
  created_at: string;
}

export function useAssets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all assets
  const { data: assets, isLoading, error } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          asset_categories(name),
          asset_locations(location_name)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Asset[];
    }
  });

  // Get asset categories
  const { data: categories } = useQuery({
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

  // Get asset locations
  const { data: locations } = useQuery({
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

  // Create asset
  const createAsset = useMutation({
    mutationFn: async (newAsset: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('assets')
        .insert({
          ...newAsset,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: "Asset created successfully",
        description: "The asset has been added to your inventory."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating asset",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update asset
  const updateAsset = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Asset> & { id: string }) => {
      const { data, error } = await supabase
        .from('assets')
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
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: "Asset updated successfully",
        description: "The asset information has been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating asset",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete asset (soft delete)
  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: "Asset deleted successfully",
        description: "The asset has been removed from your inventory."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting asset",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Asset statistics
  const assetStats = {
    total: assets?.length || 0,
    inUse: assets?.filter(asset => asset.status === 'in_use').length || 0,
    available: assets?.filter(asset => asset.status === 'available').length || 0,
    maintenance: assets?.filter(asset => asset.status === 'maintenance').length || 0,
    totalValue: assets?.reduce((sum, asset) => sum + (asset.current_book_value || 0), 0) || 0
  };

  return {
    assets,
    categories,
    locations,
    isLoading,
    error,
    assetStats,
    createAsset: createAsset.mutate,
    updateAsset: updateAsset.mutate,
    deleteAsset: deleteAsset.mutate,
    isCreating: createAsset.isPending,
    isUpdating: updateAsset.isPending,
    isDeleting: deleteAsset.isPending
  };
}