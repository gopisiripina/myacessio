import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { moduleManager } from '@/modules';
import { 
  Package, 
  Settings, 
  Download, 
  Upload,
  Power,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Puzzle
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

export default function ModuleManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Only allow admins to access this page
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const allModules = moduleManager.getAllModules();
  const enabledModules = moduleManager.getEnabledModules();

  const handleToggleModule = (moduleId: string, enable: boolean) => {
    let success = false;
    
    if (enable) {
      success = moduleManager.enableModule(moduleId);
      if (success) {
        toast({
          title: "Module Enabled",
          description: `Successfully enabled ${moduleId} module`,
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to enable ${moduleId} module. Check dependencies.`,
          variant: "destructive",
        });
      }
    } else {
      success = moduleManager.disableModule(moduleId);
      if (success) {
        toast({
          title: "Module Disabled",
          description: `Successfully disabled ${moduleId} module`,
        });
      } else {
        toast({
          title: "Error",
          description: `Cannot disable ${moduleId} module. Other modules depend on it.`,
          variant: "destructive",
        });
      }
    }
    
    if (success) {
      setRefreshKey(prev => prev + 1); // Force re-render
      // In a real app, you might want to refresh the entire app or router
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
          <Puzzle className="mr-2 md:mr-3 h-6 w-6 md:h-8 md:w-8" />
          Module Manager
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Install, configure, and manage application modules
        </p>
      </div>

      {/* Module Overview */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allModules.length}</div>
            <p className="text-xs text-muted-foreground">Available modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            <Power className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledModules.length}</div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Healthy</span>
            </div>
            <p className="text-xs text-muted-foreground">All modules operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Module List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Installed Modules
          </CardTitle>
          <CardDescription>
            Manage your application modules. Enable or disable modules based on your business needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allModules.map((module) => {
            const isEnabled = moduleManager.isModuleEnabled(module.id);
            
            return (
              <div
                key={`${module.id}-${refreshKey}`}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{module.name}</h3>
                      <Badge variant={isEnabled ? "default" : "secondary"}>
                        v{module.version}
                      </Badge>
                      {isEnabled && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {module.description}
                  </p>
                  
                  {module.dependencies && module.dependencies.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">
                        Depends on: {module.dependencies.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {/* Settings Button */}
                  {module.settingsPath && isEnabled && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={module.settingsPath}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                  )}

                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleToggleModule(module.id, checked)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Module Store (Future) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Module Store
          </CardTitle>
          <CardDescription>
            Discover and install new modules to extend your application functionality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              The module store will allow you to browse and install additional modules like:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div>• Inventory Management</div>
              <div>• Customer Relationship Management</div>
              <div>• Human Resources</div>
              <div>• Project Management</div>
              <div>• E-commerce Integration</div>
              <div>• Advanced Analytics</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}