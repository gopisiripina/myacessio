import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  CreditCard, 
  Database, 
  Home, 
  LogOut, 
  Settings, 
  Users,
  User,
  Tag,
  Layout
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Services', href: '/services', icon: Database },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Vendors', href: '/vendors', icon: Users },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Page Builder', href: '/page-builder', icon: Layout },
];

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: Settings },
];

export function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">SubsTracker</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
        
        {profile?.role === 'admin' && (
          <>
            <div className="pt-4 pb-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </h3>
            </div>
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>
      
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.display_name || user?.email}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {profile?.role || 'viewer'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            asChild
          >
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}