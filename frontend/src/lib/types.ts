export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Update the Service interface to use category_id instead of category enum
export interface Service {
  id: string;
  user_id: string;
  service_name: string;
  category_id: string; // Only the new field now
  provider: string;
  vendor_id?: string;
  plan_name?: string;
  account_email?: string;
  dashboard_url?: string;
  start_date: string;
  billing_cycle: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Custom_days';
  custom_cycle_days?: number;
  amount: number;
  currency: 'INR' | 'USD' | 'EUR';
  payment_method?: 'Card' | 'UPI' | 'NetBanking' | 'Bank Transfer' | 'PayPal' | 'Other';
  auto_renew: boolean;
  next_renewal_date?: string;
  next_renewal_amount?: number;
  reminder_days_before: number;
  status: 'Active' | 'Paused' | 'Cancelled' | 'Expired';
  importance: 'Critical' | 'Normal' | 'Nice-to-have';
  tags?: string[];
  notes?: string;
  invoice_file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  service_id: string;
  user_id: string;
  payment_date: string;
  amount: number;
  currency: 'INR' | 'USD' | 'EUR';
  paid_by?: string;
  invoice_number?: string;
  invoice_file_url?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  website?: string;
  support_email?: string;
  support_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  email?: string;
  role: 'admin' | 'finance' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalMonthlySpend: number;
  projectedYearlySpend: number;
  activeServices: number;
  expiredServices: number;
  autoRenewServices: number;
}

export interface ServiceWithPayments extends Service {
  payments?: Payment[];
  vendor?: Vendor;
  categories?: Pick<Category, 'id' | 'name' | 'icon'>; // Only the fields we select
}