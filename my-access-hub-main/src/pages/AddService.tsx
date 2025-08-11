import { ServiceForm } from '@/components/services/ServiceForm';

export default function AddService() {
  console.log('AddService page rendering');
  
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add New Service</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Add a new subscription or service to track
        </p>
      </div>
      
      <div className="max-w-2xl">
        <ServiceForm />
      </div>
    </div>
  );
}