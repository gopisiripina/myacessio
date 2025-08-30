import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';

import { Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();

  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('application_name')
        .single();
      return data as { application_name: string } | null;
    },
  });

  console.log('Layout render:', { user: !!user, loading, timestamp: new Date().toISOString() });

  // Add timeout to prevent infinite loading
  const [timeoutReached, setTimeoutReached] = React.useState(false);
  
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout reached - forcing continue');
        setTimeoutReached(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
          <p className="text-xs text-muted-foreground mt-2">If this takes too long, try refreshing</p>
        </div>
      </div>
    );
  }

  if (!user && !timeoutReached) {
    console.log('No user found, showing login form');
    return <LoginForm />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Header with hamburger menu - visible on all screen sizes */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="flex items-center gap-2">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <span className="font-semibold">{settings?.application_name || 'SubsTracker'}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <AppSidebar />

        <main className="flex-1 overflow-auto pt-14">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}