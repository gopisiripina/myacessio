import { useAuth } from './useAuth';

export function usePermissions() {
  const { profile } = useAuth();

  const canManageData = profile?.role === 'admin' || profile?.role === 'finance';
  const isAdmin = profile?.role === 'admin';
  const isViewer = profile?.role === 'viewer';

  return {
    canManageData,
    isAdmin,
    isViewer,
    role: profile?.role
  };
}