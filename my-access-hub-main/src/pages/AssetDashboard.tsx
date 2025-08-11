import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wrench,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  Settings,
  BarChart3,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AssetStats } from '@/components/assets/AssetStats';
import { AssetsTable } from '@/components/assets/AssetsTable';
import { AssetForm } from '@/components/assets/AssetForm';
import { useAssets, Asset } from '@/hooks/useAssets';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AssetDashboard() {
  const { assetStats, assets } = useAssets();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Calculate additional metrics
  const needsMaintenance = assets?.filter(asset => 
    asset.status === 'maintenance' || asset.condition === 'damaged'
  ).length || 0;

  const highValueAssets = assets?.filter(asset => 
    asset.current_book_value > 1000
  ).length || 0;

  const recentAssets = assets?.filter(asset => {
    const createdDate = new Date(asset.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length || 0;

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAsset(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <TrendingDown className="mr-3 h-8 w-8 text-primary" />
            Assets & Depreciation
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your organization's assets
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="hover-scale">
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Main Asset Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All assets in inventory
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{assetStats.inUse}</div>
            <p className="text-xs text-muted-foreground">
              Currently deployed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{needsMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              Maintenance required
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${assetStats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current book value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow hover-scale">
          <Link to="/assets/categories" className="block">
            <div className="flex items-center space-x-3">
              <Building className="h-6 w-6 text-indigo-500" />
              <div>
                <h3 className="font-medium text-sm">Asset Categories</h3>
                <p className="text-xs text-muted-foreground">
                  Organize by categories
                </p>
              </div>
            </div>
          </Link>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow hover-scale">
          <Link to="/assets/reports" className="block">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-medium text-sm">Asset Reports</h3>
                <p className="text-xs text-muted-foreground">
                  Generate reports
                </p>
              </div>
            </div>
          </Link>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow hover-scale">
          <Link to="/assets/depreciation" className="block">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-purple-500" />
              <div>
                <h3 className="font-medium text-sm">Depreciation</h3>
                <p className="text-xs text-muted-foreground">
                  Manage depreciation
                </p>
              </div>
            </div>
          </Link>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow hover-scale">
          <div className="flex items-center space-x-3">
            <Wrench className="h-6 w-6 text-orange-500" />
            <div>
              <h3 className="font-medium text-sm">Maintenance</h3>
              <p className="text-xs text-muted-foreground">
                Track maintenance
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Asset Management Section */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="flex items-center text-lg">
                <Search className="mr-2 h-5 w-5 text-indigo-500" />
                Asset Management
              </CardTitle>
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <AssetsTable onEdit={handleEdit} searchTerm={searchTerm} />
        </CardContent>
      </Card>

      {/* Asset Status & Value Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Asset Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">In Use</span>
                </div>
                <Badge variant="outline" className="font-medium">{assetStats.inUse}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Available</span>
                </div>
                <Badge variant="outline" className="font-medium">{assetStats.available}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Maintenance</span>
                </div>
                <Badge variant="outline" className="font-medium">{assetStats.maintenance}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-purple-500" />
              Asset Value Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Asset Value</span>
                <span className="font-bold text-lg">
                  ${assetStats.totalValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Asset Value</span>
                <span className="font-medium">
                  ${assetStats.total > 0 ? Math.round(assetStats.totalValue / assetStats.total).toLocaleString() : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">High Value Assets</span>
                <Badge variant="secondary">{highValueAssets}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Recent Additions</span>
                <Badge variant="secondary">{recentAssets}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAsset ? 'Edit Asset' : 'Create New Asset'}
            </DialogTitle>
          </DialogHeader>
          <AssetForm
            asset={selectedAsset || undefined}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}