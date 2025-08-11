import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { 
  BarChart3, 
  CreditCard, 
  Database, 
  Home, 
  LogOut, 
  Users,
  User,
  Tag,
  Shield,
  Package,
  FileText,
  ChevronRight,
  Repeat,
  TrendingDown,
  Puzzle,
  Building
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { moduleManager } from '@/modules';

// Main navigation
const mainNavigation = [];


// Subscription Management Module
const subscriptionNavigation = [];

// Asset Management Module
const assetNavigation = [
  { name: 'Assets & Depreciation', href: '/assets-dashboard', icon: TrendingDown },
];


// Shared Resources Module
const sharedNavigation = [
  { name: 'Vendors', href: '/vendors', icon: Users },
];

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Company Settings', href: '/admin/company-settings', icon: Building },
  { name: 'System Settings', href: '/admin/settings', icon: Shield },
  { name: 'Module Manager', href: '/admin/modules', icon: Puzzle },
];

export function AppSidebar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const sidebar = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [subscriptionsOpen, setSubscriptionsOpen] = useState(false);
  
  // Get enabled modules from module manager
  const enabledModules = moduleManager.getEnabledModules();

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isInSubscriptionSection = location.pathname.includes('/subscription-management') && location.pathname !== '/subscription-management';
  
  // Show text on desktop or when sidebar is open on mobile
  const showText = !isMobile || sidebar.open;

  // Keep subscriptions open if user is in any subscription route
  useEffect(() => {
    if (isInSubscriptionSection) {
      setSubscriptionsOpen(true);
    }
  }, [isInSubscriptionSection]);

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center">
          <h1 className={`font-bold text-foreground transition-all duration-200 ${
            showText ? 'opacity-100' : 'opacity-0 hidden'
          }`}>
            Business Manager
          </h1>
          {!showText && (
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">B</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dynamic Module Navigation */}
        {enabledModules.map((module) => (
          <SidebarGroup key={module.id}>
            <SidebarGroupLabel className={showText ? '' : 'sr-only'}>
              {module.name}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {module.sidebarItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <SidebarMenuItem key={`${module.id}-${index}`}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.href)}
                        className="w-full"
                      >
                        <Link to={item.href}>
                          <IconComponent className="h-4 w-4" />
                          {showText && <span>{item.name}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Shared Resources */}
        <SidebarGroup>
          <SidebarGroupLabel className={showText ? '' : 'sr-only'}>
            Shared
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sharedNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    className="w-full"
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      {showText && <span>{item.name}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration (Admin only) */}
        {profile?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className={showText ? '' : 'sr-only'}>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.href)}
                      className="w-full"
                    >
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        {showText && <span>{item.name}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className={`space-y-3 ${!showText ? 'items-center' : ''}`}>
          {/* User Info */}
          <div className={`flex items-center ${!showText ? 'justify-center' : 'space-x-3'}`}>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            {showText && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.display_name || user?.email}
                </p>
                <Badge variant="secondary" className="text-xs capitalize">
                  {profile?.role || 'viewer'}
                </Badge>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`space-y-2 ${!showText ? 'w-8' : ''}`}>
            <Button
              variant="outline" 
              size="sm" 
              className={`${!showText ? 'w-8 h-8 p-0' : 'w-full justify-start'}`}
              asChild
            >
              <Link to="/profile">
                <User className="h-4 w-4" />
                {showText && <span className="ml-2">Profile</span>}
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`${!showText ? 'w-8 h-8 p-0' : 'w-full justify-start'}`}
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              {showText && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
