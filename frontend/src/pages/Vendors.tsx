import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { VendorsTable } from '@/components/vendors/VendorsTable';
import { VendorForm } from '@/components/vendors/VendorForm';
import { usePermissions } from '@/hooks/usePermissions';

export default function Vendors() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { canManageData } = usePermissions();

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Vendors</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {canManageData ? 'Manage vendor information and contacts' : 'View vendor information and contacts'}
          </p>
        </div>
        {canManageData && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-3 md:mx-auto">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              <VendorForm onSuccess={() => setShowAddDialog(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <VendorsTable />
    </div>
  );
}