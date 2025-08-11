import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Database, CreditCard, Tag, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ServicesTable } from '@/components/services/ServicesTable';
import { ServiceForm } from '@/components/services/ServiceForm';
import { PaymentsTable } from '@/components/payments/PaymentsTable';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { CategoriesTable } from '@/components/categories/CategoriesTable';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { ReportsOverview } from '@/components/reports/ReportsOverview';
import { ExportAnalysis } from '@/components/reports/ExportAnalysis';
import { ServiceWithPayments } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Subscriptions() {
  const [selectedService, setSelectedService] = useState<ServiceWithPayments | null>(null);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [isServiceViewOpen, setIsServiceViewOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'payments' | 'categories' | 'reports'>('overview');

  const handleEditService = (service: ServiceWithPayments) => {
    setSelectedService(service);
    setIsServiceFormOpen(true);
  };

  const handleViewService = (service: ServiceWithPayments) => {
    setSelectedService(service);
    setIsServiceViewOpen(true);
  };

  const handleServiceFormClose = () => {
    setIsServiceFormOpen(false);
    setSelectedService(null);
  };

  const handleServiceViewClose = () => {
    setIsServiceViewOpen(false);
    setSelectedService(null);
  };

  // Overview Tab Content
  const OverviewContent = () => (
    <>
      {/* Statistics */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('services')}>
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Manage Services</h3>
              <p className="text-sm text-muted-foreground">
                View and manage all subscriptions
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('payments')}>
          <div className="flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-emerald-500" />
            <div>
              <h3 className="font-semibold">Payment History</h3>
              <p className="text-sm text-muted-foreground">
                Track subscription payments
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <Link to="/subscription-management/categories" className="block">
            <div className="flex items-center space-x-3">
              <Tag className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold">Service Categories</h3>
                <p className="text-sm text-muted-foreground">
                  Organize subscription categories
                </p>
              </div>
            </div>
          </Link>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('reports')}>
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="font-semibold">Reports & Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Generate detailed reports
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Services Preview */}
      <Card className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Recent Services</h2>
            <p className="text-muted-foreground">
              Quick overview of your subscription services
            </p>
          </div>
          <Button variant="outline" onClick={() => setActiveTab('services')}>
            View All
          </Button>
        </div>
        <ServicesTable />
      </Card>
    </>
  );

  // Services Tab Content
  const ServicesContent = () => (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Services Management</h2>
          <p className="text-muted-foreground">
            Manage and monitor your subscription services
          </p>
        </div>
        <Button onClick={() => setIsServiceFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold">All Services</h3>
          <p className="text-muted-foreground">
            Complete list of your subscription services
          </p>
        </div>
        <ServicesTable />
      </Card>
    </>
  );

  // Payments Tab Content
  const PaymentsContent = () => (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
          <p className="text-muted-foreground">
            Track and manage subscription payments
          </p>
        </div>
        <Button onClick={() => setIsPaymentFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold">All Payments</h3>
          <p className="text-muted-foreground">
            Complete history of subscription payments
          </p>
        </div>
        <PaymentsTable />
      </Card>
    </>
  );

  // Categories Tab Content  
  const CategoriesContent = () => (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Categories</h2>
          <p className="text-muted-foreground">
            Organize and manage subscription categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/subscription-management/categories">
              Advanced Management
            </Link>
          </Button>
          <Button onClick={() => setIsCategoryFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold">All Categories</h3>
          <p className="text-muted-foreground">
            Manage your service categories and organization
          </p>
        </div>
        <CategoriesTable />
      </Card>
    </>
  );

  // Reports Tab Content
  const ReportsContent = () => (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Generate detailed reports and analyze subscription data
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Overview</h3>
            <p className="text-muted-foreground">
              Key insights and analytics about your subscriptions
            </p>
          </div>
          <ReportsOverview />
        </Card>

      </div>
    </>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your subscription services
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsServiceFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>


      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewContent />}
      {activeTab === 'services' && <ServicesContent />}
      {activeTab === 'payments' && <PaymentsContent />}
      {activeTab === 'categories' && <CategoriesContent />}
      {activeTab === 'reports' && <ReportsContent />}

      {/* Service Form Dialog */}
      <Dialog open={isServiceFormOpen} onOpenChange={setIsServiceFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? 'Edit Service' : 'Create New Service'}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm />
        </DialogContent>
      </Dialog>

      {/* Service View Dialog */}
      <Dialog open={isServiceViewOpen} onOpenChange={setIsServiceViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Service Name
                  </label>
                  <p className="font-medium">{selectedService.service_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Provider
                  </label>
                  <p className="font-medium">{selectedService.provider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <p className="font-medium">{selectedService.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Billing Cycle
                  </label>
                  <p className="font-medium">{selectedService.billing_cycle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </label>
                  <p className="font-medium">
                    {selectedService.currency} {selectedService.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Next Renewal
                  </label>
                  <p className="font-medium">
                    {selectedService.next_renewal_date || 'Not set'}
                  </p>
                </div>
              </div>
              {selectedService.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Notes
                  </label>
                  <p className="mt-1">{selectedService.notes}</p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleServiceViewClose}>
                  Close
                </Button>
                <Button onClick={() => {
                  handleServiceViewClose();
                  handleEditService(selectedService);
                }}>
                  Edit Service
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Form Dialog */}
      <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm />
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <CategoryForm onSuccess={() => setIsCategoryFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}