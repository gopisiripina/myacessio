import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser } from '@/hooks/useUsers';

const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  display_name: z.string().min(1, 'Display name is required'),
  role: z.enum(['admin', 'finance', 'viewer'], {
    required_error: 'Please select a role',
  }),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { toast } = useToast();
  const createUser = useCreateUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      display_name: '',
      role: 'viewer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    try {
      await createUser.mutateAsync({
        email: data.email,
        password: data.password,
        display_name: data.display_name,
        role: data.role,
      });
      toast({
        title: 'User created successfully',
        description: `${data.display_name} has been added to the system.`,
      });
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error creating user',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleDescriptions = {
    admin: 'Full access to all features including user management',
    finance: 'Can manage services, payments, vendors, and view reports',
    viewer: 'Read-only access to view data and reports',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name *</Label>
        <Input
          id="display_name"
          {...register('display_name')}
          placeholder="Enter user's full name"
        />
        {errors.display_name && (
          <p className="text-sm text-red-600">{errors.display_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="user@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Temporary Password *</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          placeholder="At least 6 characters"
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          User will be able to change this password after first login
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select onValueChange={(value) => setValue('role', value as 'admin' | 'finance' | 'viewer')} defaultValue={selectedRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role.message}</p>
        )}
        {selectedRole && (
          <p className="text-xs text-muted-foreground">
            {roleDescriptions[selectedRole]}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating User...' : 'Create User'}
      </Button>
    </form>
  );
}