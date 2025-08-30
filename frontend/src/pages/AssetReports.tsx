import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Package,
  DollarSign,
  MapPin,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '@/hooks/useAssets';

type ReportType = 'summary' | 'by-status' | 'by-category' | 'by-location' | 'valuation' | 'depreciation';

export default function AssetReports() {
  const navigate = useNavigate();
  const { assets, categories, locations } = useAssets();
  const [selectedReport, setSelectedReport] = useState<ReportType>('summary');

  const reportTypes = [
    { value: 'summary', label: 'Asset Summary', icon: FileText },
    { value: 'by-status', label: 'Assets by Status', icon: BarChart3 },
    { value: 'by-category', label: 'Assets by Category', icon: Package },
    { value: 'by-location', label: 'Assets by Location', icon: MapPin },
    { value: 'valuation', label: 'Asset Valuation', icon: DollarSign },
    { value: 'depreciation', label: 'Depreciation Report', icon: TrendingUp },
  ];

  // Calculate asset statistics
  const assetStats = {
    total: assets?.length || 0,
    totalValue: assets?.reduce((sum, asset) => sum + (asset.current_book_value || 0), 0) || 0,
    averageValue: assets?.length > 0 ? (assets?.reduce((sum, asset) => sum + (asset.current_book_value || 0), 0) || 0) / assets.length : 0,
    byStatus: {
      in_use: assets?.filter(a => a.status === 'in_use').length || 0,
      available: assets?.filter(a => a.status === 'available').length || 0,
      maintenance: assets?.filter(a => a.status === 'maintenance').length || 0,
      disposed: assets?.filter(a => a.status === 'disposed').length || 0,
      lost: assets?.filter(a => a.status === 'lost').length || 0,
    },
    byCondition: {
      new: assets?.filter(a => a.condition === 'new').length || 0,
      used: assets?.filter(a => a.condition === 'used').length || 0,
      refurbished: assets?.filter(a => a.condition === 'refurbished').length || 0,
      damaged: assets?.filter(a => a.condition === 'damaged').length || 0,
    }
  };

  // Group assets by category
  const assetsByCategory = categories?.map(category => ({
    name: category.name,
    count: assets?.filter(asset => asset.asset_category_id === category.id).length || 0,
    value: assets?.filter(asset => asset.asset_category_id === category.id)
      .reduce((sum, asset) => sum + (asset.current_book_value || 0), 0) || 0
  })) || [];

  // Group assets by location
  const assetsByLocation = locations?.map(location => ({
    name: location.location_name,
    department: location.department,
    count: assets?.filter(asset => asset.location_id === location.id).length || 0,
    value: assets?.filter(asset => asset.location_id === location.id)
      .reduce((sum, asset) => sum + (asset.current_book_value || 0), 0) || 0
  })) || [];

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderReport = () => {
    switch (selectedReport) {
      case 'summary':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                      <p className="text-2xl font-bold">{assetStats.total}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold">${assetStats.totalValue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Value</p>
                      <p className="text-2xl font-bold">${Math.round(assetStats.averageValue).toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">In Use</p>
                      <p className="text-2xl font-bold">{assetStats.byStatus.in_use}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Assets by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(assetStats.byStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Assets by Condition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(assetStats.byCondition).map(([condition, count]) => (
                      <div key={condition} className="flex justify-between items-center">
                        <span className="capitalize">{condition}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'by-category':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Assets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Asset Count</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Average Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetsByCategory.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.count}</TableCell>
                      <TableCell>${category.value.toLocaleString()}</TableCell>
                      <TableCell>
                        ${category.count > 0 ? Math.round(category.value / category.count).toLocaleString() : 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case 'by-location':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Assets by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Asset Count</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetsByLocation.map((location, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.department || '-'}</TableCell>
                      <TableCell>{location.count}</TableCell>
                      <TableCell>${location.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case 'valuation':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Asset Valuation Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purchase Cost</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Depreciation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets?.map((asset) => {
                    const depreciation = asset.purchase_cost - asset.current_book_value;
                    const depreciationPercent = asset.purchase_cost > 0 ? 
                      ((depreciation / asset.purchase_cost) * 100).toFixed(1) : '0';
                    
                    return (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.asset_code}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{asset.asset_categories?.name || 'Uncategorized'}</TableCell>
                        <TableCell>${asset.purchase_cost.toLocaleString()}</TableCell>
                        <TableCell>${asset.current_book_value.toLocaleString()}</TableCell>
                        <TableCell>
                          ${depreciation.toLocaleString()} ({depreciationPercent}%)
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Select a report type to view details</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight">Asset Reports</h1>
            <p className="text-muted-foreground">
              Generate detailed reports about your assets
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            const reportData = selectedReport === 'by-category' ? assetsByCategory :
                             selectedReport === 'by-location' ? assetsByLocation :
                             assets || [];
            exportToCSV(reportData, `asset-report-${selectedReport}`);
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Report Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {reportTypes.map((type) => (
              <Card 
                key={type.value}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedReport === type.value ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => setSelectedReport(type.value as ReportType)}
              >
                <CardContent className="p-4 text-center">
                  <type.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{type.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
}