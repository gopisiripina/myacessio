import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, AlertTriangle, Database } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ClearOptions {
  services: boolean;
  payments: boolean;
  vendors: boolean;
  categories: boolean;
  confirmText: string;
}

export function DataClear() {
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [clearOptions, setClearOptions] = useState<ClearOptions>({
    services: false,
    payments: false,
    vendors: false,
    categories: false,
    confirmText: ''
  });

  const clearSelectedData = async () => {
    if (clearOptions.confirmText !== 'DELETE ALL DATA') {
      toast({
        title: "Confirmation required",
        description: "Please type 'DELETE ALL DATA' to confirm",
        variant: "destructive"
      });
      return;
    }

    setIsClearing(true);
    const results = [];

    try {
      // Clear in correct order to respect foreign key constraints
      if (clearOptions.payments) {
        const { error } = await supabase
          .from('payments')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) throw new Error(`Failed to clear payments: ${error.message}`);
        results.push('Payments cleared');
      }

      if (clearOptions.services) {
        const { error } = await supabase
          .from('services')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) throw new Error(`Failed to clear services: ${error.message}`);
        results.push('Services cleared');
      }

      if (clearOptions.vendors) {
        const { error } = await supabase
          .from('vendors')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) throw new Error(`Failed to clear vendors: ${error.message}`);
        results.push('Vendors cleared');
      }

      if (clearOptions.categories) {
        // Don't delete the default category
        const { error } = await supabase
          .from('categories')
          .delete()
          .neq('id', '39904b37-b9ff-4a5f-af6f-88cb1169f6ab'); // Keep default category
        
        if (error) throw new Error(`Failed to clear categories: ${error.message}`);
        results.push('Categories cleared');
      }

      toast({
        title: "Data cleared successfully",
        description: results.join(', ')
      });

      // Reset form
      setClearOptions({
        services: false,
        payments: false,
        vendors: false,
        categories: false,
        confirmText: ''
      });

    } catch (error) {
      console.error('Clear data error:', error);
      toast({
        title: "Clear data failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const hasSelection = clearOptions.services || clearOptions.payments || clearOptions.vendors || clearOptions.categories;

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <Trash2 className="mr-2 h-5 w-5" />
          Clear Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-destructive/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            <strong>Danger Zone:</strong> This action cannot be undone. All selected data will be permanently deleted.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Select data to clear:</Label>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clear-payments"
                checked={clearOptions.payments}
                onCheckedChange={(checked) =>
                  setClearOptions(prev => ({ ...prev, payments: !!checked }))
                }
              />
              <Label htmlFor="clear-payments" className="text-sm">
                All Payments Data
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="clear-services"
                checked={clearOptions.services}
                onCheckedChange={(checked) =>
                  setClearOptions(prev => ({ ...prev, services: !!checked }))
                }
              />
              <Label htmlFor="clear-services" className="text-sm">
                All Services Data
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="clear-vendors"
                checked={clearOptions.vendors}
                onCheckedChange={(checked) =>
                  setClearOptions(prev => ({ ...prev, vendors: !!checked }))
                }
              />
              <Label htmlFor="clear-vendors" className="text-sm">
                All Vendors Data
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="clear-categories"
                checked={clearOptions.categories}
                onCheckedChange={(checked) =>
                  setClearOptions(prev => ({ ...prev, categories: !!checked }))
                }
              />
              <Label htmlFor="clear-categories" className="text-sm">
                Custom Categories (keeps default)
              </Label>
            </div>
          </div>
        </div>

        {hasSelection && (
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-medium">
              Type "DELETE ALL DATA" to confirm:
            </Label>
            <input
              id="confirm-text"
              type="text"
              value={clearOptions.confirmText}
              onChange={(e) => setClearOptions(prev => ({ ...prev, confirmText: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="DELETE ALL DATA"
            />
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              disabled={!hasSelection || clearOptions.confirmText !== 'DELETE ALL DATA' || isClearing}
              className="w-full"
            >
              <Database className="mr-2 h-4 w-4" />
              {isClearing ? 'Clearing Data...' : 'Clear Selected Data'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The following data will be permanently deleted:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {clearOptions.payments && <li>All payment records</li>}
                  {clearOptions.services && <li>All service subscriptions</li>}
                  {clearOptions.vendors && <li>All vendor information</li>}
                  {clearOptions.categories && <li>All custom categories</li>}
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={clearSelectedData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, delete permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}