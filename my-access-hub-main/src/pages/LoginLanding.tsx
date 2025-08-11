import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  LogIn, 
  Code, 
  Eye, 
  Sparkles, 
  Zap,
  Layout,
  MousePointer,
  Smartphone,
  Monitor,
  Users,
  Globe,
  Shield,
  BarChart3,
  ChevronRight,
  Play,
  Star
} from 'lucide-react';

import { AuthForms } from '@/components/auth/AuthForms';
import { PageBuilder } from '@/components/pageBuilder/PageBuilder';
import { useAuth } from '@/hooks/useAuth';
import assetWorkflowImage from '@/assets/asset-workflow.jpg';
import subscriptionWorkflowImage from '@/assets/subscription-workflow.jpg';
import paymentWorkflowImage from '@/assets/payment-workflow.jpg';

const LoginLanding = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('builder');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/subscriptions');
    }
  }, [user, loading, navigate]);

  const handlePreview = () => {
    // This would open a preview modal or new window
    console.log('Preview functionality would be implemented here');
  };

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gradient-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-background)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-10 bg-[var(--glass-bg)] backdrop-blur-lg border-b border-border/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Palette className="h-8 w-8 text-primary drop-shadow-sm" />
                  <div className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-full blur-xl"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ModularERP
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                  Features
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-foreground/80 hover:text-foreground"
                  onClick={() => navigate('/docs')}
                >
                  Documentation
                </Button>
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                  Pricing
                </Button>
                <Button onClick={handleGetStarted} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  <LogIn className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="pt-32 pb-20 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-6 relative">
            <div className="text-center max-w-5xl mx-auto mb-20">
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-4 w-4 mr-2" />
                Tailor-Made ERP Solution
              </Badge>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
                Build Your Perfect
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  ERP System
                </span>
                <span className="block text-foreground/90">With Custom Modules</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
                Choose from our comprehensive suite of ERP modules - CRM, HR, Inventory, Accounting, Sales, Projects, and more. Enable only what you need.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <Button 
                  onClick={handleGetStarted}
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
                >
                  Start Free Trial
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setActiveTab('demo')}
                  className="text-lg px-8 py-4 border-2 hover:bg-accent/10 hover:border-accent"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9/5 rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10,000+ companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Enterprise secure</span>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Layout className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Modular Architecture</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enable only the modules you need - CRM, HR, Inventory, Accounting, Sales, Projects, and more
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Custom Workflows</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Build workflows that match your business processes with our drag-and-drop automation builder
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Unified Analytics</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Get insights across all modules with unified reporting and real-time business intelligence
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ERP Modules Details Section */}
      <div className="bg-background border-t border-border/50">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Code className="h-4 w-4 mr-2" />
              Unified ERP Modules
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Complete Business
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Management Suite
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive modules that work together seamlessly to manage every aspect of your business operations
            </p>
          </div>

          {/* Modules Grid - Including Existing Modules */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Existing Asset Management Module */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Asset Management</CardTitle>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Live Module</Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Complete asset lifecycle management with tracking, depreciation, and maintenance scheduling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Asset Registration & Tracking
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Depreciation Management
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Maintenance Scheduling
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Asset Categories & Reports
                </div>
              </CardContent>
            </Card>

            {/* Existing Subscription Management Module */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-l-4 border-l-accent">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Subscription Management</CardTitle>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Live Module</Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Comprehensive subscription lifecycle management with automated billing and renewals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Service Subscription Tracking
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Automated Renewal Alerts
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Cost Optimization Analytics
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Vendor Management Integration
                </div>
              </CardContent>
            </Card>

            {/* Existing Payment Management Module */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Payment Processing</CardTitle>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Live Module</Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Integrated payment processing with multi-currency support and financial reporting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Payment Gateway Integration
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Multi-Currency Processing
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Automated Invoice Generation
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Financial Analytics & Reports
                </div>
              </CardContent>
            </Card>
            {/* CRM Module - Planned */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 opacity-75">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Customer Relationship Management</CardTitle>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Coming Soon</Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Complete customer lifecycle management with lead tracking, sales pipeline, and customer support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Lead Management & Conversion
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Sales Pipeline & Forecasting
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Customer Support Tickets
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Contact & Account Management
                </div>
              </CardContent>
            </Card>

            {/* HR Module - Planned */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 opacity-75">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Human Resources</CardTitle>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Coming Soon</Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Complete employee lifecycle management from recruitment to retirement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Employee Database & Profiles
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Recruitment & Onboarding
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Performance Management
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Payroll & Benefits Administration
                </div>
              </CardContent>
            </Card>

            {/* Inventory Module - Planned */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 opacity-75">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Inventory Management</CardTitle>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Coming Soon</Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Real-time inventory tracking, warehouse management, and supply chain optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Stock Level Monitoring
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Warehouse Management
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Purchase Order Management
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Supplier & Vendor Management
                </div>
              </CardContent>
            </Card>

            {/* Accounting Module - Planned */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 opacity-75">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Financial Accounting</CardTitle>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Coming Soon</Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Comprehensive financial management with automated bookkeeping and reporting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  General Ledger & Chart of Accounts
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Accounts Payable & Receivable
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Financial Reporting & Analytics
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Tax Management & Compliance
                </div>
              </CardContent>
            </Card>

            {/* Sales Module - Planned */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 opacity-75">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Sales Management</CardTitle>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Coming Soon</Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  End-to-end sales process management with quotations, orders, and invoicing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Quote & Proposal Generation
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Order Processing & Fulfillment
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Invoice & Payment Tracking
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Sales Performance Analytics
                </div>
              </CardContent>
            </Card>

            {/* Projects Module - Planned */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 opacity-75">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                    <Layout className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Project Management</CardTitle>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Coming Soon</Badge>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Complete project lifecycle management with task tracking and resource allocation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Project Planning & Scheduling
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Task & Milestone Tracking
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Resource & Budget Management
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Team Collaboration Tools
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Functional Flow Diagrams Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-4 py-2">
                <Layout className="h-4 w-4 mr-2" />
                Module Workflows
              </Badge>
              <h3 className="text-3xl font-bold mb-4">
                Functional Flow of
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Unified Modules
                </span>
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how our live modules work together to streamline your business processes
              </p>
            </div>

            <div className="space-y-12">
              {/* Asset Management Workflow */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Monitor className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">Asset Management Workflow</h4>
                        <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">Live Module</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Complete asset lifecycle management from registration to disposal with automated depreciation tracking and maintenance scheduling.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Asset Registration</div>
                          <div className="text-sm text-muted-foreground">Register new assets with categories, vendors, and purchase information</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Categorization & Tracking</div>
                          <div className="text-sm text-muted-foreground">Organize assets by categories and track location, condition, and usage</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Depreciation Calculation</div>
                          <div className="text-sm text-muted-foreground">Automated depreciation tracking with configurable methods and schedules</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Reporting & Analytics</div>
                          <div className="text-sm text-muted-foreground">Comprehensive reports on asset value, depreciation, and maintenance costs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/20 flex items-center justify-center p-8">
                    <div className="w-full h-64 bg-white rounded-lg shadow-lg overflow-hidden">
                      <img 
                        src={assetWorkflowImage} 
                        alt="Asset Management Workflow Diagram" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Subscription Management Workflow */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="bg-muted/20 flex items-center justify-center p-8 order-2 lg:order-1">
                    <div className="w-full h-64 bg-white rounded-lg shadow-lg overflow-hidden">
                      <img 
                        src={subscriptionWorkflowImage} 
                        alt="Subscription Management Workflow Diagram" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">Subscription Management Workflow</h4>
                        <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">Live Module</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Automated subscription lifecycle management with smart renewal alerts, cost optimization, and vendor integration.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Service Discovery</div>
                          <div className="text-sm text-muted-foreground">Discover and catalog all business services and subscriptions</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Automated Billing</div>
                          <div className="text-sm text-muted-foreground">Track billing cycles, payments, and generate automated reminders</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Renewal Management</div>
                          <div className="text-sm text-muted-foreground">Smart alerts for upcoming renewals with cost analysis</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Cost Optimization</div>
                          <div className="text-sm text-muted-foreground">Analytics to identify cost savings and subscription optimization opportunities</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Processing Workflow */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">Payment Processing Workflow</h4>
                        <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">Live Module</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Comprehensive payment processing with multi-currency support, automated invoicing, and real-time financial analytics.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Invoice Generation</div>
                          <div className="text-sm text-muted-foreground">Automated invoice creation with customizable templates and branding</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Payment Gateway Integration</div>
                          <div className="text-sm text-muted-foreground">Seamless integration with multiple payment providers and gateways</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Multi-Currency Processing</div>
                          <div className="text-sm text-muted-foreground">Handle international payments with real-time currency conversion</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium">Financial Reporting</div>
                          <div className="text-sm text-muted-foreground">Real-time financial dashboards and comprehensive reporting analytics</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/20 flex items-center justify-center p-8">
                    <div className="w-full h-64 bg-white rounded-lg shadow-lg overflow-hidden">
                      <img 
                        src={paymentWorkflowImage} 
                        alt="Payment Processing Workflow Diagram" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* System Flow Diagram */}
          <div className="bg-muted/20 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">Unified ERP System Flow</h3>
            <div className="bg-background rounded-xl p-6 shadow-inner">
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <p className="text-muted-foreground text-sm mb-4">ERP System Workflow</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-blue-50 rounded p-3">
                    <div className="font-medium text-blue-900">Sales Process</div>
                    <div className="text-blue-700 mt-1">Lead → Quote → Order → Fulfillment → Invoice</div>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <div className="font-medium text-green-900">Project Flow</div>
                    <div className="text-green-700 mt-1">Resource → Assignment → Tracking → Billing</div>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <div className="font-medium text-purple-900">Supply Chain</div>
                    <div className="text-purple-700 mt-1">Supplier → Purchase → Payment → Stock</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture & Documentation Section */}
      <div className="bg-background/95 backdrop-blur-sm border-t border-border/50">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Code className="h-4 w-4 mr-2" />
              System Architecture
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Project Structure &
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Technical Foundation
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built on modern web technologies with scalable architecture and maintainable code structure
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Project Structure */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Code className="h-4 w-4 text-primary" />
                  </div>
                  Project Structure Topology
                </CardTitle>
                <CardDescription>
                  Modular file organization following React best practices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  <div className="text-muted-foreground">
                    <div>📁 src/</div>
                    <div>├── 📁 components/</div>
                    <div>│   ├── 📁 ui/ (Shadcn components)</div>
                    <div>│   ├── 📁 layout/ (Layout components)</div>
                    <div>│   └── 📁 [module]/ (Feature components)</div>
                    <div>├── 📁 pages/ (Route components)</div>
                    <div>├── 📁 hooks/ (Custom React hooks)</div>
                    <div>├── 📁 modules/ (Business logic modules)</div>
                    <div>├── 📁 lib/ (Utilities & types)</div>
                    <div>└── 📁 integrations/ (External services)</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Modular component architecture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Separation of concerns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Reusable business logic</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-accent" />
                  </div>
                  Technology Stack
                </CardTitle>
                <CardDescription>
                  Modern web technologies for performance and scalability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-blue-900">Frontend</div>
                    <div className="text-sm text-blue-700">React + TypeScript</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-green-900">Styling</div>
                    <div className="text-sm text-green-700">Tailwind CSS</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-purple-900">Backend</div>
                    <div className="text-sm text-purple-700">Supabase</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-orange-900">Build Tool</div>
                    <div className="text-sm text-orange-700">Vite</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Server-side rendering ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time database sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Type-safe development</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* UI Design System */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 mb-16">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <Palette className="h-4 w-4 text-white" />
                </div>
                UI Layout Style & Design System
              </CardTitle>
              <CardDescription>
                Consistent design language with semantic tokens and modular components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Color System</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-primary rounded"></div>
                      <span className="text-sm">Primary: HSL semantic tokens</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-accent rounded"></div>
                      <span className="text-sm">Accent: Complementary colors</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-muted rounded"></div>
                      <span className="text-sm">Muted: Background variants</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Typography</h4>
                  <div className="space-y-2 text-sm">
                    <div>Headings: System font stack</div>
                    <div>Body: Inter/System fonts</div>
                    <div>Code: Monospace families</div>
                    <div>Responsive scaling</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Components</h4>
                  <div className="space-y-2 text-sm">
                    <div>Shadcn/ui foundation</div>
                    <div>Custom variants & themes</div>
                    <div>Accessibility compliant</div>
                    <div>Glass morphism effects</div>
                  </div>
                </div>
              </div>
              
              {/* Layout Architecture Diagram */}
              <div className="bg-muted/20 rounded-xl p-6">
                <h4 className="font-semibold mb-4 text-center">Layout Architecture</h4>
                <div className="bg-background rounded-lg p-4 shadow-inner">
                  <div className="bg-muted/30 rounded p-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="font-medium">Application Layer</div>
                        <div className="bg-blue-50 rounded p-2 text-blue-900">App Root → Theme Provider</div>
                        <div className="bg-green-50 rounded p-2 text-green-900">Layout Component</div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium">Component Hierarchy</div>
                        <div className="bg-purple-50 rounded p-2 text-purple-900">Pages → Features → UI</div>
                        <div className="bg-orange-50 rounded p-2 text-orange-900">Sidebar & Navigation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="bg-background/95 backdrop-blur-sm border-t border-border/50">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Code className="h-4 w-4 mr-2" />
              Interactive Platform
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Build Your Custom
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ERP Solution
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your modules, customize workflows, and create the perfect ERP system for your business
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-12 bg-muted/50 p-1">
              <TabsTrigger value="builder" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
                Dashboard Preview
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MousePointer className="h-4 w-4" />
                Page Builder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-8">
              <Card className="border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                        ERP Module Dashboard
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        Unified dashboard showing all your enabled ERP modules and key business metrics
                      </CardDescription>
                    </div>
                    <Button onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
                      Access Full Platform
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Active Modules</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">8/12</Badge>
                      </div>
                      <div className="text-2xl font-bold text-primary">CRM, HR, Sales</div>
                    </div>
                    <div className="bg-accent/5 rounded-lg p-6 border border-accent/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Records</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">+15%</Badge>
                      </div>
                      <div className="text-2xl font-bold text-accent">24,847</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Automation Rules</span>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Active</Badge>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">127</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">This is a preview of your modular ERP dashboard</p>
                    <Button onClick={() => setActiveTab('demo')} variant="outline">
                      Explore Page Builder
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demo" className="space-y-8">
              <Card className="border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center">
                          <MousePointer className="h-4 w-4 text-accent" />
                        </div>
                        Module Configuration
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        Enable, disable, and configure ERP modules to match your business needs
                      </CardDescription>
                    </div>
                    <Button onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
                      Try Page Builder
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] border-b border-border/50 overflow-hidden">
                    <PageBuilder 
                      onPreview={handlePreview}
                      className="h-full"
                    />
                  </div>
                  <div className="p-6 bg-muted/20">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">
                        This is a live demo of our module configuration. Enable modules to build your custom ERP.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={() => setActiveTab('builder')} variant="outline" size="sm">
                          View Dashboard
                        </Button>
                        <Button onClick={handleGetStarted} size="sm" className="bg-primary hover:bg-primary/90">
                          Get Full Access
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
            <Button
              onClick={() => setShowAuthModal(false)}
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10 bg-white hover:bg-gray-100"
            >
              ✕
            </Button>
            <AuthForms onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-primary/5 border-t border-border/50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <Palette className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-full blur-xl"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ModularERP
              </span>
            </div>
            <p className="text-muted-foreground mb-8 text-lg">
              Build your perfect ERP system with modular components tailored to your business needs
            </p>
            <div className="flex justify-center gap-8 mb-8 text-sm text-muted-foreground">
              <span>Enterprise Ready</span>
              <span>•</span>
              <span>99.9% Uptime</span>
              <span>•</span>
              <span>24/7 Support</span>
            </div>
            <Separator className="bg-border/50 mb-8" />
            <p className="text-sm text-muted-foreground">
              © 2024 ModularERP. All rights reserved. Built with modern web technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginLanding;