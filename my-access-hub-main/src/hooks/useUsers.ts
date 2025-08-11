import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';

interface CreateUserData {
  email: string;
  password: string;
  display_name: string;
  role: 'admin' | 'finance' | 'viewer';
}

export function useUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email for admin-created users
        user_metadata: {
          display_name: userData.display_name,
        }
      });

      if (authError) throw authError;

      // Update the profile with role and display name
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            display_name: userData.display_name,
            role: userData.role,
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'finance' | 'viewer' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete the user from Supabase Auth (this will cascade delete the profile)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}