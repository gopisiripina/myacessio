import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Shield } from 'lucide-react';
import { UsersTable } from '@/components/admin/UsersTable';
import { CreateUserForm } from '@/components/admin/CreateUserForm';
import { Navigate } from 'react-router-dom';

export default function UserManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { profile } = useAuth();

  // Only allow admins to access this page
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center flex-wrap">
            <Shield className="mr-2 md:mr-3 h-6 w-6 md:h-8 md:w-8" />
            User Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage user accounts and permissions (Admin only)
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-3 max-w-md md:mx-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <CreateUserForm onSuccess={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <UsersTable />
    </div>
  );
}