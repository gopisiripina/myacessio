import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, Wrench, DollarSign } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';

export function AssetStats() {
  const { assetStats } = useAssets();

  const stats = [
    {
      title: 'Total Assets',
      value: assetStats.total,
      icon: Package,
      description: 'All assets in inventory'
    },
    {
      title: 'In Use',
      value: assetStats.inUse,
      icon: CheckCircle,
      description: 'Currently deployed assets'
    },
    {
      title: 'Available',
      value: assetStats.available,
      icon: Package,
      description: 'Ready for deployment'
    },
    {
      title: 'Maintenance',
      value: assetStats.maintenance,
      icon: Wrench,
      description: 'Under maintenance'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
      
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Asset Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${assetStats.totalValue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Current book value of all assets
          </p>
        </CardContent>
      </Card>
    </div>
  );
}