import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Code, 
  Palette, 
  Settings, 
  Database, 
  Zap,
  Layout,
  Shield,
  Globe,
  Users,
  BarChart3,
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Package,
  Terminal,
  FileText,
  Layers,
  Folder,
  Eye,
  Lock,
  Wrench,
  Monitor,
  Smartphone,
  Server,
  Activity,
  PieChart,
  Calendar,
  Mail,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Save,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share2,
  Copy,
  Move,
  Archive,
  Hash,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Documentation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--gradient-background)]">
      {/* Header */}
      <div className="bg-[var(--glass-bg)] backdrop-blur-lg border-b border-border/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">ModularERP Documentation</h1>
                  <p className="text-sm text-muted-foreground">Complete guide to building your custom ERP system</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              v2.0.0
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <a href="#overview" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  📋 Project Overview
                </a>
                <a href="#architecture" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  🏗️ System Architecture
                </a>
                <a href="#database" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  🗄️ Database Schema
                </a>
                <a href="#components" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  🧩 Component Library
                </a>
                <a href="#ui-system" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  🎨 UI Design System
                </a>
                <a href="#forms" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  📝 Forms & Validation
                </a>
                <a href="#api-patterns" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  🔌 API Patterns
                </a>
                <a href="#authentication" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  🔐 Authentication
                </a>
                <a href="#modules" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  📦 Module System
                </a>
                <a href="#styling" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  💎 Styling Guide
                </a>
                <a href="#hooks" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  🪝 Custom Hooks
                </a>
                <a href="#utils" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  🛠️ Utilities
                </a>
                <a href="#deployment" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  🚀 Deployment
                </a>
                <a href="#knowledge-transfer" className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors">
                  📚 Knowledge Transfer
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Overview Section */}
            <section id="overview">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Project Overview</h2>
                  <p className="text-muted-foreground">Understanding ModularERP's architecture and philosophy</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      What is ModularERP?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>ModularERP is a modern, scalable Enterprise Resource Planning system built with a modular architecture that allows businesses to enable only the features they need.</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Modular component architecture</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Real-time data synchronization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Scalable cloud infrastructure</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-accent" />
                      Core Principles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>Built on modern web technologies with enterprise-grade security and performance in mind.</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Security-first design</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Performance optimized</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span>Developer-friendly API</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* System Architecture Section */}
            <section id="architecture">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">System Architecture</h2>
                  <p className="text-muted-foreground">Complete technical foundation and structure</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Technology Stack Deep Dive</CardTitle>
                    <CardDescription>Detailed breakdown of technologies and their roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Frontend Architecture
                        </h4>
                        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                          <div className="font-medium">React 18 + TypeScript</div>
                          <div className="text-sm text-blue-700">• Function components with hooks</div>
                          <div className="text-sm text-blue-700">• Type-safe development</div>
                          <div className="text-sm text-blue-700">• React Router for navigation</div>
                          <div className="text-sm text-blue-700">• Context API for state management</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 space-y-2">
                          <div className="font-medium">Styling & Components</div>
                          <div className="text-sm text-green-700">• Tailwind CSS for utility-first styling</div>
                          <div className="text-sm text-green-700">• Shadcn/ui for UI components</div>
                          <div className="text-sm text-green-700">• CSS custom properties for theming</div>
                          <div className="text-sm text-green-700">• Responsive design principles</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          Backend Architecture
                        </h4>
                        <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                          <div className="font-medium">Supabase Backend</div>
                          <div className="text-sm text-purple-700">• PostgreSQL database</div>
                          <div className="text-sm text-purple-700">• Real-time subscriptions</div>
                          <div className="text-sm text-purple-700">• Row Level Security (RLS)</div>
                          <div className="text-sm text-purple-700">• Edge Functions for logic</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 space-y-2">
                          <div className="font-medium">Authentication & Security</div>
                          <div className="text-sm text-orange-700">• JWT-based authentication</div>
                          <div className="text-sm text-orange-700">• Role-based access control</div>
                          <div className="text-sm text-orange-700">• Secure API endpoints</div>
                          <div className="text-sm text-orange-700">• Database-level security</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Project Structure Topology</CardTitle>
                    <CardDescription>Comprehensive file organization and module architecture</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
                      <div className="space-y-1 text-muted-foreground">
                        <div className="font-bold text-foreground">📁 ModularERP/</div>
                        <div>├── 📁 public/ <span className="text-blue-600"># Static assets</span></div>
                        <div>├── 📁 src/</div>
                        <div>│   ├── 📁 components/ <span className="text-blue-600"># Reusable UI components</span></div>
                        <div>│   │   ├── 📁 ui/ <span className="text-green-600"># Shadcn base components</span></div>
                        <div>│   │   │   ├── button.tsx</div>
                        <div>│   │   │   ├── card.tsx</div>
                        <div>│   │   │   ├── form.tsx</div>
                        <div>│   │   │   └── ...</div>
                        <div>│   │   ├── 📁 layout/ <span className="text-green-600"># Layout components</span></div>
                        <div>│   │   │   ├── AppSidebar.tsx</div>
                        <div>│   │   │   ├── Layout.tsx</div>
                        <div>│   │   │   └── ThemeProvider.tsx</div>
                        <div>│   │   ├── 📁 admin/ <span className="text-green-600"># Admin-specific components</span></div>
                        <div>│   │   ├── 📁 assets/ <span className="text-green-600"># Asset management components</span></div>
                        <div>│   │   ├── 📁 services/ <span className="text-green-600"># Service/subscription components</span></div>
                        <div>│   │   └── 📁 payments/ <span className="text-green-600"># Payment processing components</span></div>
                        <div>│   ├── 📁 pages/ <span className="text-blue-600"># Route-level components</span></div>
                        <div>│   │   ├── Dashboard.tsx</div>
                        <div>│   │   ├── LoginLanding.tsx</div>
                        <div>│   │   ├── Services.tsx</div>
                        <div>│   │   └── ...</div>
                        <div>│   ├── 📁 hooks/ <span className="text-blue-600"># Custom React hooks</span></div>
                        <div>│   │   ├── useAuth.tsx</div>
                        <div>│   │   ├── useServices.ts</div>
                        <div>│   │   ├── useAssets.ts</div>
                        <div>│   │   └── ...</div>
                        <div>│   ├── 📁 lib/ <span className="text-blue-600"># Utilities and types</span></div>
                        <div>│   │   ├── types.ts</div>
                        <div>│   │   ├── utils.ts</div>
                        <div>│   │   └── currency.ts</div>
                        <div>│   ├── 📁 integrations/ <span className="text-blue-600"># External service integrations</span></div>
                        <div>│   │   └── 📁 supabase/</div>
                        <div>│   │       ├── client.ts</div>
                        <div>│   │       └── types.ts</div>
                        <div>│   ├── 📁 modules/ <span className="text-blue-600"># Business logic modules</span></div>
                        <div>│   │   ├── 📁 assets/</div>
                        <div>│   │   └── 📁 subscriptions/</div>
                        <div>│   ├── index.css <span className="text-purple-600"># Global styles & design tokens</span></div>
                        <div>│   ├── main.tsx <span className="text-purple-600"># Application entry point</span></div>
                        <div>│   └── App.tsx <span className="text-purple-600"># Root component & routing</span></div>
                        <div>├── tailwind.config.ts <span className="text-orange-600"># Tailwind configuration</span></div>
                        <div>├── vite.config.ts <span className="text-orange-600"># Vite build configuration</span></div>
                        <div>└── package.json <span className="text-orange-600"># Dependencies & scripts</span></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Database Schema Section */}
            <section id="database">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Database Schema</h2>
                  <p className="text-muted-foreground">Complete database structure and field definitions</p>
                </div>
              </div>

              <div className="space-y-6">
                <Tabs defaultValue="assets" className="w-full">
                  <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="auth">Auth & Users</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                  </TabsList>

                  <TabsContent value="assets" className="space-y-6">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle>Assets Table Structure</CardTitle>
                        <CardDescription>Core asset management fields and their purposes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Primary Fields</h4>
                              <div className="space-y-2 text-sm">
                                <div><code className="bg-primary/10 px-2 py-1 rounded">id</code> - UUID primary key</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">name</code> - Asset display name</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">asset_code</code> - Unique identifier</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">description</code> - Asset details</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">user_id</code> - Owner reference</div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Financial Fields</h4>
                              <div className="space-y-2 text-sm">
                                <div><code className="bg-accent/10 px-2 py-1 rounded">purchase_cost</code> - Initial cost</div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">current_book_value</code> - Current value</div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">condition</code> - Asset condition enum</div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">status</code> - Availability status</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Related Tables</h4>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="font-medium">asset_categories</div>
                                <div className="text-muted-foreground">Categorization system</div>
                              </div>
                              <div>
                                <div className="font-medium">depreciation</div>
                                <div className="text-muted-foreground">Depreciation tracking</div>
                              </div>
                              <div>
                                <div className="font-medium">asset_locations</div>
                                <div className="text-muted-foreground">Physical location data</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="services" className="space-y-6">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle>Services Table Structure</CardTitle>
                        <CardDescription>Subscription management fields and billing cycles</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Service Identification</h4>
                              <div className="space-y-2 text-sm">
                                <div><code className="bg-primary/10 px-2 py-1 rounded">service_name</code> - Service title</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">provider</code> - Service provider</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">plan_name</code> - Subscription plan</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">account_email</code> - Account identifier</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">dashboard_url</code> - Management portal</div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Billing Configuration</h4>
                              <div className="space-y-2 text-sm">
                                <div><code className="bg-accent/10 px-2 py-1 rounded">amount</code> - Subscription cost</div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">currency</code> - Currency enum</div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">billing_cycle</code> - Frequency enum</div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">auto_renew</code> - Auto-renewal flag</div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">next_renewal_date</code> - Next billing</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Enums & Status</h4>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="font-medium">service_status</div>
                                <div className="text-muted-foreground">Active, Cancelled, Expired</div>
                              </div>
                              <div>
                                <div className="font-medium">billing_cycle</div>
                                <div className="text-muted-foreground">Monthly, Yearly, Custom</div>
                              </div>
                              <div>
                                <div className="font-medium">importance_level</div>
                                <div className="text-muted-foreground">Critical, High, Normal, Low</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="auth" className="space-y-6">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle>Authentication & User Management</CardTitle>
                        <CardDescription>User profiles, roles, and permission system</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Profiles Table</h4>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">user_id</code> - References auth.users</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">display_name</code> - User display name</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">email</code> - Contact email</div>
                              </div>
                              <div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">role</code> - User role enum</div>
                                <div className="text-muted-foreground mt-2">Roles: admin, finance, manager, viewer</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Row Level Security (RLS)</h4>
                            <div className="space-y-2 text-sm">
                              <div>• <strong>User Isolation:</strong> Each user sees only their own data</div>
                              <div>• <strong>Role-based Access:</strong> Admin/finance roles have broader permissions</div>
                              <div>• <strong>Function-based Policies:</strong> Custom functions like <code>can_manage_data()</code></div>
                              <div>• <strong>Table-specific Rules:</strong> Different policies per table and operation</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="system" className="space-y-6">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle>System Configuration Tables</CardTitle>
                        <CardDescription>Application settings and configuration management</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Company Settings</h4>
                              <div className="space-y-2 text-sm">
                                <div><code className="bg-primary/10 px-2 py-1 rounded">company_profile</code> - Company details</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">system_settings</code> - App configuration</div>
                                <div><code className="bg-primary/10 px-2 py-1 rounded">notification_settings</code> - Alert preferences</div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Integration Settings</h4>
                              <div className="space-y-2 text-sm">
                                <div><code className="bg-accent/10 px-2 py-1 rounded">email_settings</code> - SMTP configuration</div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">sms_settings</code> - SMS provider setup</div>
                                <div><code className="bg-accent/10 px-2 py-1 rounded">whatsapp_settings</code> - WhatsApp integration</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* Component Library Section */}
            <section id="components">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Component Library</h2>
                  <p className="text-muted-foreground">Detailed component structure and usage patterns</p>
                </div>
              </div>

              <div className="space-y-6">
                <Tabs defaultValue="ui" className="w-full">
                  <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
                    <TabsTrigger value="ui">UI Components</TabsTrigger>
                    <TabsTrigger value="forms">Form Components</TabsTrigger>
                    <TabsTrigger value="tables">Data Tables</TabsTrigger>
                    <TabsTrigger value="layout">Layout Components</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ui" className="space-y-6">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle>Shadcn/ui Base Components</CardTitle>
                        <CardDescription>Foundation components with variants and customization</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-semibold">Interactive Components</h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                              <div>
                                <div className="font-medium">Button Component</div>
                                <div className="text-sm text-muted-foreground">Variants: default, destructive, outline, secondary, ghost, link</div>
                                <div className="text-sm text-muted-foreground">Sizes: default, sm, lg, icon</div>
                              </div>
                              <div>
                                <div className="font-medium">Input Components</div>
                                <div className="text-sm text-muted-foreground">Input, Textarea, Select, Checkbox, Switch</div>
                              </div>
                              <div>
                                <div className="font-medium">Navigation</div>
                                <div className="text-sm text-muted-foreground">Tabs, Breadcrumb, Pagination, Command</div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-semibold">Display Components</h4>
                            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                              <div>
                                <div className="font-medium">Data Display</div>
                                <div className="text-sm text-muted-foreground">Card, Table, Badge, Avatar, Progress</div>
                              </div>
                              <div>
                                <div className="font-medium">Feedback Components</div>
                                <div className="text-sm text-muted-foreground">Toast, Alert, Skeleton, Spinner</div>
                              </div>
                              <div>
                                <div className="font-medium">Overlay Components</div>
                                <div className="text-sm text-muted-foreground">Dialog, Sheet, Popover, Tooltip</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="forms" className="space-y-6">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle>Form Components & Validation</CardTitle>
                        <CardDescription>React Hook Form integration with Zod validation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Form Architecture</h4>
                            <div className="space-y-2 text-sm">
                              <div>• <strong>React Hook Form:</strong> Form state management and validation</div>
                              <div>• <strong>Zod Schemas:</strong> Type-safe validation with TypeScript inference</div>
                              <div>• <strong>Form Components:</strong> Reusable form fields with error handling</div>
                              <div>• <strong>Auto-validation:</strong> Real-time validation with user feedback</div>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Key Form Components</h4>
                              <div className="space-y-1 text-sm">
                                <div>• <code>AssetForm</code> - Asset creation/editing</div>
                                <div>• <code>ServiceForm</code> - Service subscription forms</div>
                                <div>• <code>PaymentForm</code> - Payment processing</div>
                                <div>• <code>CategoryForm</code> - Category management</div>
                                <div>• <code>VendorForm</code> - Vendor information</div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Validation Patterns</h4>
                              <div className="space-y-1 text-sm">
                                <div>• Required field validation</div>
                                <div>• Email format validation</div>
                                <div>• Currency amount validation</div>
                                <div>• Date range validation</div>
                                <div>• Custom business rule validation</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tables" className="space-y-6">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle>Data Table Components</CardTitle>
                        <CardDescription>Responsive tables with sorting, filtering, and pagination</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Table Features</h4>
                              <div className="space-y-1 text-sm">
                                <div>• <strong>Responsive Design:</strong> Mobile/desktop layouts</div>
                                <div>• <strong>Column Sorting:</strong> Ascending/descending sort</div>
                                <div>• <strong>Search & Filter:</strong> Real-time data filtering</div>
                                <div>• <strong>Pagination:</strong> Server-side pagination support</div>
                                <div>• <strong>Row Actions:</strong> Edit, delete, view actions</div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Main Table Components</h4>
                              <div className="space-y-1 text-sm">
                                <div>• <code>AssetsTable</code> - Asset management grid</div>
                                <div>• <code>ServicesTable</code> - Service subscriptions</div>
                                <div>• <code>PaymentsTable</code> - Payment history</div>
                                <div>• <code>UsersTable</code> - User management</div>
                                <div>• <code>VendorsTable</code> - Vendor directory</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Mobile Responsiveness</h4>
                            <div className="space-y-2 text-sm">
                              <div>• <strong>Card Layout:</strong> Tables transform to cards on mobile</div>
                              <div>• <strong>Touch Gestures:</strong> Swipe actions for mobile interactions</div>
                              <div>• <strong>Condensed Information:</strong> Priority-based data display</div>
                              <div>• <strong>Overflow Handling:</strong> Horizontal scroll for wide tables</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-6">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle>Layout System</CardTitle>
                        <CardDescription>Application layout structure and navigation patterns</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Layout Architecture</h4>
                            <div className="space-y-2 text-sm">
                              <div>• <strong>AppSidebar:</strong> Main navigation with collapsible design</div>
                              <div>• <strong>Layout:</strong> Root layout wrapper with sidebar integration</div>
                              <div>• <strong>ThemeProvider:</strong> Dark/light mode switching capability</div>
                              <div>• <strong>Responsive Breakpoints:</strong> Mobile-first responsive design</div>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Navigation Structure</h4>
                              <div className="space-y-1 text-sm">
                                <div>• Dashboard overview</div>
                                <div>• Asset management section</div>
                                <div>• Service subscriptions</div>
                                <div>• Payment processing</div>
                                <div>• Reports & analytics</div>
                                <div>• Admin/settings areas</div>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h4 className="font-semibold mb-3">Theme System</h4>
                              <div className="space-y-1 text-sm">
                                <div>• CSS custom properties</div>
                                <div>• Dark/light mode support</div>
                                <div>• Semantic color tokens</div>
                                <div>• Consistent spacing scale</div>
                                <div>• Typography hierarchy</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* UI Design System Section */}
            <section id="ui-system">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <Palette className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">UI Design System</h2>
                  <p className="text-muted-foreground">Complete design tokens, patterns, and style guide</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Design Tokens & CSS Variables</CardTitle>
                    <CardDescription>Semantic design system with consistent theming</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Color System (HSL Values)</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium mb-2">Primary Colors</div>
                            <div className="space-y-1 font-mono">
                              <div>--background: 0 0% 100%</div>
                              <div>--foreground: 222.2 84% 4.9%</div>
                              <div>--primary: 222.2 47.4% 11.2%</div>
                              <div>--primary-foreground: 210 40% 98%</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Secondary Colors</div>
                            <div className="space-y-1 font-mono">
                              <div>--secondary: 210 40% 96%</div>
                              <div>--accent: 210 40% 95%</div>
                              <div>--muted: 210 40% 93%</div>
                              <div>--border: 214.3 31.8% 91.4%</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Semantic Colors</div>
                            <div className="space-y-1 font-mono">
                              <div>--destructive: 0 62.8% 30.6%</div>
                              <div>--warning: 38 92% 50%</div>
                              <div>--success: 142 76% 36%</div>
                              <div>--info: 221 83% 53%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Typography System</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="font-medium mb-2">Font Families</div>
                            <div className="space-y-1 text-sm font-mono">
                              <div>--font-sans: "Inter", sans-serif</div>
                              <div>--font-mono: "JetBrains Mono", monospace</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Typography Scale</div>
                            <div className="space-y-1 text-sm">
                              <div>• Headings: 2xl, xl, lg, base</div>
                              <div>• Body text: base, sm, xs</div>
                              <div>• Line heights: tight, normal, relaxed</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Spacing & Layout</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium mb-2">Spacing Scale</div>
                            <div className="space-y-1 font-mono">
                              <div>0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Border Radius</div>
                            <div className="space-y-1 font-mono">
                              <div>sm: 0.25rem, md: 0.375rem, lg: 0.5rem</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Forms & Validation Section */}
            <section id="forms">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                  <Edit className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Forms & Validation</h2>
                  <p className="text-muted-foreground">Complete form architecture and validation patterns</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Form Architecture Overview</CardTitle>
                    <CardDescription>React Hook Form + Zod validation implementation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Form Libraries & Tools</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium mb-2">React Hook Form</div>
                            <div className="space-y-1">
                              <div>• Performant form state management</div>
                              <div>• Minimal re-renders</div>
                              <div>• Built-in validation support</div>
                              <div>• TypeScript integration</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Zod Validation</div>
                            <div className="space-y-1">
                              <div>• Runtime type validation</div>
                              <div>• Schema-based approach</div>
                              <div>• TypeScript type inference</div>
                              <div>• Custom validation rules</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Validation Patterns</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Field Validation</div>
                            <div className="text-muted-foreground">Required, email, min/max length, patterns</div>
                          </div>
                          <div>
                            <div className="font-medium">Business Rules</div>
                            <div className="text-muted-foreground">Date ranges, currency formats, unique constraints</div>
                          </div>
                          <div>
                            <div className="font-medium">Cross-field Validation</div>
                            <div className="text-muted-foreground">Dependent fields, conditional validation</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Form Field Types & Usage</CardTitle>
                    <CardDescription>Comprehensive field types with examples and validation rules</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Basic Input Fields</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                            <div>
                              <div className="font-medium">Text Input</div>
                              <div className="text-muted-foreground">Service name, asset description, vendor name</div>
                            </div>
                            <div>
                              <div className="font-medium">Email Input</div>
                              <div className="text-muted-foreground">Account email, contact information</div>
                            </div>
                            <div>
                              <div className="font-medium">Number Input</div>
                              <div className="text-muted-foreground">Cost amounts, quantities, percentages</div>
                            </div>
                            <div>
                              <div className="font-medium">Date Picker</div>
                              <div className="text-muted-foreground">Purchase dates, renewal dates, deadlines</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold">Complex Field Types</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                            <div>
                              <div className="font-medium">Select Dropdown</div>
                              <div className="text-muted-foreground">Categories, currencies, billing cycles</div>
                            </div>
                            <div>
                              <div className="font-medium">Multi-select</div>
                              <div className="text-muted-foreground">Tags, features, permissions</div>
                            </div>
                            <div>
                              <div className="font-medium">File Upload</div>
                              <div className="text-muted-foreground">Invoices, receipts, documentation</div>
                            </div>
                            <div>
                              <div className="font-medium">Rich Text Editor</div>
                              <div className="text-muted-foreground">Notes, descriptions, comments</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* API Patterns Section */}
            <section id="api-patterns">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">API Patterns</h2>
                  <p className="text-muted-foreground">Supabase integration patterns and data management</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Supabase Client Patterns</CardTitle>
                    <CardDescription>Common data access patterns and best practices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">CRUD Operations</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
                          <div>
                            <div className="font-medium mb-2">Create</div>
                            <div className="bg-green-50 p-2 rounded text-green-800">
                              supabase.from('table').insert(data)
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Read</div>
                            <div className="bg-blue-50 p-2 rounded text-blue-800">
                              supabase.from('table').select('*')
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Update</div>
                            <div className="bg-yellow-50 p-2 rounded text-yellow-800">
                              supabase.from('table').update(data)
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Delete</div>
                            <div className="bg-red-50 p-2 rounded text-red-800">
                              supabase.from('table').delete()
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Real-time Subscriptions</h4>
                        <div className="space-y-2 text-sm">
                          <div>• <strong>Table Changes:</strong> Listen to INSERT, UPDATE, DELETE events</div>
                          <div>• <strong>User-specific Data:</strong> Filter subscriptions by user_id</div>
                          <div>• <strong>Cleanup:</strong> Proper subscription cleanup on component unmount</div>
                          <div>• <strong>Error Handling:</strong> Connection loss and reconnection handling</div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Query Optimization</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Performance</div>
                            <div className="space-y-1">
                              <div>• Select only needed columns</div>
                              <div>• Use appropriate filters</div>
                              <div>• Implement pagination</div>
                              <div>• Cache frequently accessed data</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Security</div>
                            <div className="space-y-1">
                              <div>• Row Level Security enforcement</div>
                              <div>• User context validation</div>
                              <div>• Input sanitization</div>
                              <div>• Permission checks</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Authentication Section */}
            <section id="authentication">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Authentication System</h2>
                  <p className="text-muted-foreground">Complete authentication flow and security implementation</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Authentication Flow</CardTitle>
                    <CardDescription>User authentication, session management, and security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Auth Components</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium mb-2">Login/Register</div>
                            <div className="space-y-1">
                              <div>• Email/password authentication</div>
                              <div>• Social login options</div>
                              <div>• Password reset flow</div>
                              <div>• Email verification</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Session Management</div>
                            <div className="space-y-1">
                              <div>• JWT token handling</div>
                              <div>• Automatic token refresh</div>
                              <div>• Session persistence</div>
                              <div>• Logout functionality</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Role-Based Access Control</h4>
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Admin</div>
                            <div className="text-muted-foreground">Full system access</div>
                          </div>
                          <div>
                            <div className="font-medium">Finance</div>
                            <div className="text-muted-foreground">Financial data management</div>
                          </div>
                          <div>
                            <div className="font-medium">Manager</div>
                            <div className="text-muted-foreground">Team data access</div>
                          </div>
                          <div>
                            <div className="font-medium">Viewer</div>
                            <div className="text-muted-foreground">Read-only access</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Module System Section */}
            <section id="modules">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Module System</h2>
                  <p className="text-muted-foreground">Modular architecture and extensibility patterns</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Module Architecture</CardTitle>
                    <CardDescription>How modules are structured and integrated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Current Active Modules</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-primary">Asset Management</div>
                            <div className="text-muted-foreground">Complete asset lifecycle tracking</div>
                          </div>
                          <div>
                            <div className="font-medium text-accent">Subscription Management</div>
                            <div className="text-muted-foreground">Service subscription tracking</div>
                          </div>
                          <div>
                            <div className="font-medium text-green-600">Payment Processing</div>
                            <div className="text-muted-foreground">Financial transaction management</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Module Components</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium mb-2">Core Components</div>
                            <div className="space-y-1">
                              <div>• Module configuration</div>
                              <div>• Route definitions</div>
                              <div>• Navigation items</div>
                              <div>• Permission requirements</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Module Features</div>
                            <div className="space-y-1">
                              <div>• Isolated state management</div>
                              <div>• Module-specific APIs</div>
                              <div>• Custom hooks</div>
                              <div>• Dedicated components</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Styling Guide Section */}
            <section id="styling">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Styling Guide</h2>
                  <p className="text-muted-foreground">Comprehensive styling patterns and best practices</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Tailwind CSS Implementation</CardTitle>
                    <CardDescription>Utility-first styling with semantic design tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Semantic Class Patterns</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium mb-2">Layout Classes</div>
                            <div className="space-y-1 font-mono">
                              <div>• container mx-auto px-6</div>
                              <div>• grid md:grid-cols-2 gap-6</div>
                              <div>• flex items-center gap-3</div>
                              <div>• space-y-4</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">Component Classes</div>
                            <div className="space-y-1 font-mono">
                              <div>• bg-card/60 backdrop-blur-sm</div>
                              <div>• border-border/50</div>
                              <div>• text-muted-foreground</div>
                              <div>• hover:bg-muted/50</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Design System Integration</h4>
                        <div className="space-y-2 text-sm">
                          <div>• <strong>No Direct Colors:</strong> Always use semantic tokens (--primary, --accent)</div>
                          <div>• <strong>Consistent Spacing:</strong> Use design system spacing scale</div>
                          <div>• <strong>Component Variants:</strong> Leverage shadcn component variants</div>
                          <div>• <strong>Responsive Design:</strong> Mobile-first approach with breakpoints</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Custom Hooks Section */}
            <section id="hooks">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <Hash className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Custom Hooks</h2>
                  <p className="text-muted-foreground">Reusable logic patterns and state management</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Application Hooks</CardTitle>
                    <CardDescription>Custom hooks for data management and business logic</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Data Management Hooks</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                            <div>
                              <div className="font-medium">useServices</div>
                              <div className="text-muted-foreground">Service subscription CRUD operations</div>
                            </div>
                            <div>
                              <div className="font-medium">useAssets</div>
                              <div className="text-muted-foreground">Asset management and tracking</div>
                            </div>
                            <div>
                              <div className="font-medium">usePayments</div>
                              <div className="text-muted-foreground">Payment processing and history</div>
                            </div>
                            <div>
                              <div className="font-medium">useVendors</div>
                              <div className="text-muted-foreground">Vendor information management</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold">System Hooks</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                            <div>
                              <div className="font-medium">useAuth</div>
                              <div className="text-muted-foreground">Authentication state and methods</div>
                            </div>
                            <div>
                              <div className="font-medium">usePermissions</div>
                              <div className="text-muted-foreground">Role-based access control</div>
                            </div>
                            <div>
                              <div className="font-medium">useToast</div>
                              <div className="text-muted-foreground">User feedback and notifications</div>
                            </div>
                            <div>
                              <div className="font-medium">useMobile</div>
                              <div className="text-muted-foreground">Responsive design detection</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Utilities Section */}
            <section id="utils">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Utilities</h2>
                  <p className="text-muted-foreground">Helper functions and utility libraries</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Utility Functions</CardTitle>
                    <CardDescription>Common helper functions and type utilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Core Utilities</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                            <div>
                              <div className="font-medium">utils.ts</div>
                              <div className="text-muted-foreground">Class name utilities, formatting helpers</div>
                            </div>
                            <div>
                              <div className="font-medium">currency.ts</div>
                              <div className="text-muted-foreground">Currency formatting and conversion</div>
                            </div>
                            <div>
                              <div className="font-medium">types.ts</div>
                              <div className="text-muted-foreground">TypeScript type definitions</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold">Validation & Formatting</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                            <div>
                              <div className="font-medium">Date Formatting</div>
                              <div className="text-muted-foreground">Consistent date display formats</div>
                            </div>
                            <div>
                              <div className="font-medium">Number Formatting</div>
                              <div className="text-muted-foreground">Currency, percentage, and decimal formatting</div>
                            </div>
                            <div>
                              <div className="font-medium">String Utilities</div>
                              <div className="text-muted-foreground">Capitalization, truncation, validation</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Deployment Section */}
            <section id="deployment">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Deployment Guide</h2>
                  <p className="text-muted-foreground">Production deployment and hosting strategies</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Production Deployment</CardTitle>
                    <CardDescription>Step-by-step deployment process and optimization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Build Process</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm font-mono">
                            <div className="text-green-600"># Install dependencies</div>
                            <div>npm install</div>
                            <div className="text-green-600"># Run type checks</div>
                            <div>npm run type-check</div>
                            <div className="text-green-600"># Build for production</div>
                            <div>npm run build</div>
                            <div className="text-green-600"># Preview build locally</div>
                            <div>npm run preview</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold">Environment Setup</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                            <div>• Configure environment variables</div>
                            <div>• Set up Supabase production instance</div>
                            <div>• Configure domain and SSL</div>
                            <div>• Set up monitoring and analytics</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Hosting Platforms</h4>
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Vercel</div>
                            <div className="text-muted-foreground">Recommended, Git integration</div>
                          </div>
                          <div>
                            <div className="font-medium">Netlify</div>
                            <div className="text-muted-foreground">Form handling, redirects</div>
                          </div>
                          <div>
                            <div className="font-medium">AWS Amplify</div>
                            <div className="text-muted-foreground">Full-stack hosting</div>
                          </div>
                          <div>
                            <div className="font-medium">Custom VPS</div>
                            <div className="text-muted-foreground">Full control, Docker</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Knowledge Transfer Section */}
            <section id="knowledge-transfer">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Knowledge Transfer</h2>
                  <p className="text-muted-foreground">Essential information for developers and maintainers</p>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Development Workflow</CardTitle>
                    <CardDescription>Best practices for maintaining and extending the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Code Organization Principles</h4>
                        <div className="space-y-2 text-sm">
                          <div>• <strong>Modular Architecture:</strong> Keep features isolated and self-contained</div>
                          <div>• <strong>Component Reusability:</strong> Create small, focused, reusable components</div>
                          <div>• <strong>Type Safety:</strong> Leverage TypeScript for compile-time error checking</div>
                          <div>• <strong>Consistent Naming:</strong> Follow established naming conventions</div>
                          <div>• <strong>Documentation:</strong> Comment complex logic and business rules</div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Key Development Patterns</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium mb-2">Data Flow</div>
                            <div className="space-y-1">
                              <div>• Custom hooks for data management</div>
                              <div>• React Query for server state</div>
                              <div>• Context for app-wide state</div>
                              <div>• Form state with React Hook Form</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">UI Patterns</div>
                            <div className="space-y-1">
                              <div>• Composition over inheritance</div>
                              <div>• Consistent design system usage</div>
                              <div>• Responsive design principles</div>
                              <div>• Accessibility considerations</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Security Considerations</h4>
                        <div className="space-y-2 text-sm">
                          <div>• <strong>Row Level Security:</strong> All data access is user-scoped</div>
                          <div>• <strong>Input Validation:</strong> Client and server-side validation</div>
                          <div>• <strong>Permission Checks:</strong> Role-based access control</div>
                          <div>• <strong>Secure APIs:</strong> Authenticated and authorized endpoints</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Troubleshooting Guide</CardTitle>
                    <CardDescription>Common issues and their solutions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Common Issues</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                            <div>
                              <div className="font-medium">Database Connection</div>
                              <div className="text-muted-foreground">Check Supabase environment variables</div>
                            </div>
                            <div>
                              <div className="font-medium">RLS Policy Errors</div>
                              <div className="text-muted-foreground">Verify user context and permissions</div>
                            </div>
                            <div>
                              <div className="font-medium">Build Failures</div>
                              <div className="text-muted-foreground">TypeScript errors, missing dependencies</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold">Debug Tools</h4>
                          <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                            <div>
                              <div className="font-medium">Browser DevTools</div>
                              <div className="text-muted-foreground">Network tab, console errors</div>
                            </div>
                            <div>
                              <div className="font-medium">Supabase Dashboard</div>
                              <div className="text-muted-foreground">Database queries, auth logs</div>
                            </div>
                            <div>
                              <div className="font-medium">React DevTools</div>
                              <div className="text-muted-foreground">Component tree, hook state</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Support Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-border/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Complete Documentation</h3>
                <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
                  This comprehensive documentation covers every aspect of the ModularERP system from architecture to deployment. 
                  Use this as your complete reference for understanding, maintaining, and extending the application.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    GitHub Repository
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Community Support
                  </Button>
                  <Button className="gap-2">
                    <Shield className="h-4 w-4" />
                    Enterprise Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;