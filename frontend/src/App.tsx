import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Layout } from "@/components/layout/Layout";
import { Suspense } from "react";

// Core pages (not module-specific)
import LoginLanding from "./pages/LoginLanding";
import Documentation from "./pages/Documentation";
import Profile from "./pages/Profile";
import UserManagement from "./pages/admin/UserManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import SubscriptionSettings from "./pages/admin/SubscriptionSettings";
import AssetSettings from "./pages/admin/AssetSettings";
import CompanySettings from "./pages/admin/CompanySettings";
import ModuleManager from "./pages/admin/ModuleManager";
import NotFound from "./pages/NotFound";
import Vendors from "./pages/Vendors";
import PageBuilder from "./pages/PageBuilder";
import Home from "./pages/Home";

// Module system
import { initializeModules, moduleManager } from "@/modules";

// Initialize modules on app startup
initializeModules();


const queryClient = new QueryClient();

const AppContent = () => {
  // Get enabled routes from module manager
  const moduleRoutes = moduleManager.getEnabledRoutes();
  const { user, loading } = useAuth();

  // If loading, show loading state without Layout to avoid nested useAuth calls
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show login landing page without Layout
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LoginLanding />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If authenticated, show main app with Layout
  return (
    <Layout>
      <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
        <Routes>
          {/* Redirect to home for authenticated users */}
          <Route 
            path="/" 
            element={<Navigate to="/home" replace />} 
          />
          <Route 
            path="/home" 
            element={<Home />} 
          />

          {/* Protected module routes */}
          {moduleRoutes.map((route, index) => (
            <Route
              key={`${route.path}-${index}`}
              path={route.path}
              element={<route.component />}
            />
          ))}

          {/* Core/Shared routes - protected */}
          <Route 
            path="/page-builder" 
            element={<PageBuilder />} 
          />
          <Route 
            path="/vendors" 
            element={<Vendors />} 
          />
          <Route 
            path="/profile" 
            element={<Profile />} 
          />
          
          {/* Admin routes - protected */}
          <Route 
            path="/admin/users" 
            element={<UserManagement />} 
          />
          <Route 
            path="/admin/settings" 
            element={<SystemSettings />} 
          />
          <Route 
            path="/admin/subscription-settings" 
            element={<SubscriptionSettings />} 
          />
          <Route 
            path="/admin/asset-settings" 
            element={<AssetSettings />} 
          />
          <Route 
            path="/admin/company-settings" 
            element={<CompanySettings />} 
          />
          <Route 
            path="/admin/modules" 
            element={<ModuleManager />} 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
