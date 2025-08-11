import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';

export default function AddAsset() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/assets-dashboard');
  };

  const handleCancel = () => {
    navigate('/assets-dashboard');
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
          <h1 className="text-3xl font-bold tracking-tight">Add New Asset</h1>
          <p className="text-muted-foreground">
            Create a new asset record for your organization
          </p>
        </div>
      </div>

      <AssetForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}