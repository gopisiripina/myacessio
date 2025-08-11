import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceEditForm } from '@/components/services/ServiceEditForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) throw new Error('Service ID is required');
      
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories!inner(id, name, icon)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Service</h1>
            <p className="text-muted-foreground">Loading service details...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Service</h1>
            <p className="text-muted-foreground text-red-600">
              {error?.message || 'Service not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Service</h1>
          <p className="text-muted-foreground">
            Update {service.service_name} details
          </p>
        </div>
      </div>

      <ServiceEditForm service={service} />
    </div>
  );
}