import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Asset, useAssets } from '@/hooks/useAssets';

const statusColors = {
  in_use: 'bg-green-100 text-green-800',
  available: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  disposed: 'bg-red-100 text-red-800',
  lost: 'bg-gray-100 text-gray-800'
};

const conditionColors = {
  new: 'bg-emerald-100 text-emerald-800',
  used: 'bg-blue-100 text-blue-800',
  refurbished: 'bg-purple-100 text-purple-800',
  damaged: 'bg-red-100 text-red-800'
};

interface AssetsTableProps {
  onEdit?: (asset: Asset) => void;
  onView?: (asset: Asset) => void;
  searchTerm?: string;
}

export function AssetsTable({ onEdit, onView, searchTerm: externalSearchTerm }: AssetsTableProps) {
  const { assets, isLoading, deleteAsset } = useAssets();
  const [internalSearchTerm, setInternalSearchTerm] = useState('');

  // Use external search term if provided, otherwise use internal
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

  const filteredAssets = assets?.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div>Loading assets...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Only show search input if external search is not provided */}
      {externalSearchTerm === undefined && (
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by name, code, or description..."
            value={internalSearchTerm}
            onChange={(e) => setInternalSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Asset Code</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Condition</TableHead>
              <TableHead className="w-[120px]">Location</TableHead>
              <TableHead className="w-[120px]">Book Value</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? 'No assets match your search.' : 'No assets found. Create your first asset!'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="py-3">
                    <div className="font-medium text-sm text-blue-600">
                      {asset.asset_code}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{asset.name}</div>
                      {asset.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {asset.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="text-xs font-normal">
                      {asset.asset_categories?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge 
                      className={`${statusColors[asset.status]} text-xs font-normal`}
                      variant="secondary"
                    >
                      {asset.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge 
                      className={`${conditionColors[asset.condition]} text-xs font-normal`}
                      variant="secondary"
                    >
                      {asset.condition}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-sm">
                      {asset.asset_locations?.location_name || 'Not assigned'}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-semibold text-sm">
                      ${asset.current_book_value.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-muted">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border shadow-md">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(asset)}>
                            <Eye className="mr-2 h-4 w-4 text-blue-500" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(asset)}>
                            <Edit className="mr-2 h-4 w-4 text-green-500" />
                            Edit Asset
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => deleteAsset(asset.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                          Delete Asset
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}