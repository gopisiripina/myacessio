export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      asset_categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asset_locations: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department: string | null
          floor: string | null
          id: string
          location_name: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department?: string | null
          floor?: string | null
          id?: string
          location_name: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department?: string | null
          floor?: string | null
          id?: string
          location_name?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asset_settings: {
        Row: {
          asset_audit_reminder_days: number
          created_at: string
          default_depreciation_method: Database["public"]["Enums"]["depreciation_method"]
          default_salvage_value_percent: number
          default_useful_life_years: number
          depreciation_calculation_frequency: string
          id: string
          maintenance_reminder_days: number
          updated_at: string
        }
        Insert: {
          asset_audit_reminder_days?: number
          created_at?: string
          default_depreciation_method?: Database["public"]["Enums"]["depreciation_method"]
          default_salvage_value_percent?: number
          default_useful_life_years?: number
          depreciation_calculation_frequency?: string
          id?: string
          maintenance_reminder_days?: number
          updated_at?: string
        }
        Update: {
          asset_audit_reminder_days?: number
          created_at?: string
          default_depreciation_method?: Database["public"]["Enums"]["depreciation_method"]
          default_salvage_value_percent?: number
          default_useful_life_years?: number
          depreciation_calculation_frequency?: string
          id?: string
          maintenance_reminder_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      asset_vendors: {
        Row: {
          contact_info: Json | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          location: string | null
          name: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          location?: string | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          location?: string | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          asset_category_id: string | null
          asset_code: string
          assigned_to_department: string | null
          assigned_to_user: string | null
          condition: Database["public"]["Enums"]["asset_condition"] | null
          created_at: string | null
          created_by: string | null
          current_book_value: number | null
          deleted_at: string | null
          description: string | null
          end_of_life: string | null
          id: string
          location_id: string | null
          model_number: string | null
          name: string
          purchase_cost: number | null
          qr_code_url: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status"] | null
          sub_category: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          asset_category_id?: string | null
          asset_code: string
          assigned_to_department?: string | null
          assigned_to_user?: string | null
          condition?: Database["public"]["Enums"]["asset_condition"] | null
          created_at?: string | null
          created_by?: string | null
          current_book_value?: number | null
          deleted_at?: string | null
          description?: string | null
          end_of_life?: string | null
          id?: string
          location_id?: string | null
          model_number?: string | null
          name: string
          purchase_cost?: number | null
          qr_code_url?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          sub_category?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          asset_category_id?: string | null
          asset_code?: string
          assigned_to_department?: string | null
          assigned_to_user?: string | null
          condition?: Database["public"]["Enums"]["asset_condition"] | null
          created_at?: string | null
          created_by?: string | null
          current_book_value?: number | null
          deleted_at?: string | null
          description?: string | null
          end_of_life?: string | null
          id?: string
          location_id?: string | null
          model_number?: string | null
          name?: string
          purchase_cost?: number | null
          qr_code_url?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          sub_category?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_asset_category_id_fkey"
            columns: ["asset_category_id"]
            isOneToOne: false
            referencedRelation: "asset_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "asset_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          asset_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          file_path: string
          id: string
          kind: Database["public"]["Enums"]["attachment_kind"] | null
          updated_at: string | null
          updated_by: string | null
          uploaded_by: string
          user_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          file_path: string
          id?: string
          kind?: Database["public"]["Enums"]["attachment_kind"] | null
          updated_at?: string | null
          updated_by?: string | null
          uploaded_by: string
          user_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          file_path?: string
          id?: string
          kind?: Database["public"]["Enums"]["attachment_kind"] | null
          updated_at?: string | null
          updated_by?: string | null
          uploaded_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          asset_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          remarks: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
          verified_by: string
          verified_on: string
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          remarks?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          verified_by: string
          verified_on: string
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          remarks?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          verified_by?: string
          verified_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      company_calendar_assignments: {
        Row: {
          calendar_date: string
          created_at: string
          created_by: string | null
          day_type: Database["public"]["Enums"]["day_type"]
          id: string
          note: string | null
          updated_at: string
          updated_by: string | null
          year: number | null
        }
        Insert: {
          calendar_date: string
          created_at?: string
          created_by?: string | null
          day_type: Database["public"]["Enums"]["day_type"]
          id?: string
          note?: string | null
          updated_at?: string
          updated_by?: string | null
          year?: number | null
        }
        Update: {
          calendar_date?: string
          created_at?: string
          created_by?: string | null
          day_type?: Database["public"]["Enums"]["day_type"]
          id?: string
          note?: string | null
          updated_at?: string
          updated_by?: string | null
          year?: number | null
        }
        Relationships: []
      }
      company_profile: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_logo_url: string | null
          company_name: string
          country: string | null
          created_at: string
          currency: string | null
          description: string | null
          email: string | null
          employee_count: number | null
          founded_year: number | null
          id: string
          industry: string | null
          phone: string | null
          postal_code: string | null
          registration_number: string | null
          state: string | null
          tax_id: string | null
          timezone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_logo_url?: string | null
          company_name: string
          country?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_logo_url?: string | null
          company_name?: string
          country?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      depreciation: {
        Row: {
          asset_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          is_depreciable: boolean | null
          method: Database["public"]["Enums"]["depreciation_method"] | null
          rate_percent: number | null
          salvage_value: number | null
          start_date: string
          updated_at: string | null
          updated_by: string | null
          useful_life_years: number | null
          user_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_depreciable?: boolean | null
          method?: Database["public"]["Enums"]["depreciation_method"] | null
          rate_percent?: number | null
          salvage_value?: number | null
          start_date: string
          updated_at?: string | null
          updated_by?: string | null
          useful_life_years?: number | null
          user_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_depreciable?: boolean | null
          method?: Database["public"]["Enums"]["depreciation_method"] | null
          rate_percent?: number | null
          salvage_value?: number | null
          start_date?: string
          updated_at?: string | null
          updated_by?: string | null
          useful_life_years?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "depreciation_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      depreciation_log: {
        Row: {
          amount: number
          asset_id: string
          book_value_after: number
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          period: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          amount: number
          asset_id: string
          book_value_after: number
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          period: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          asset_id?: string
          book_value_after?: number
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          period?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "depreciation_log_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string
          id: string
          imap_encryption: string | null
          imap_host: string | null
          imap_password: string | null
          imap_port: number | null
          imap_username: string | null
          is_enabled: boolean
          smtp_encryption: string
          smtp_from_email: string
          smtp_from_name: string
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_username: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          imap_encryption?: string | null
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_username?: string | null
          is_enabled?: boolean
          smtp_encryption?: string
          smtp_from_email: string
          smtp_from_name: string
          smtp_host: string
          smtp_password: string
          smtp_port?: number
          smtp_username: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          imap_encryption?: string | null
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_username?: string | null
          is_enabled?: boolean
          smtp_encryption?: string
          smtp_from_email?: string
          smtp_from_name?: string
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_username?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          notification_types: Json | null
          push_notifications: boolean
          sms_notifications: boolean
          updated_at: string
          whatsapp_notifications: boolean
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_types?: Json | null
          push_notifications?: boolean
          sms_notifications?: boolean
          updated_at?: string
          whatsapp_notifications?: boolean
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_types?: Json | null
          push_notifications?: boolean
          sms_notifications?: boolean
          updated_at?: string
          whatsapp_notifications?: boolean
        }
        Relationships: []
      }
      page_layouts: {
        Row: {
          created_at: string
          edges: Json
          id: string
          name: string
          nodes: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          edges?: Json
          id?: string
          name: string
          nodes?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          edges?: Json
          id?: string
          name?: string
          nodes?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          id: string
          invoice_file_url: string | null
          invoice_number: string | null
          paid_by: string | null
          payment_date: string
          remarks: string | null
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency"]
          id?: string
          invoice_file_url?: string | null
          invoice_number?: string | null
          paid_by?: string | null
          payment_date: string
          remarks?: string | null
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          id?: string
          invoice_file_url?: string | null
          invoice_number?: string | null
          paid_by?: string | null
          payment_date?: string
          remarks?: string | null
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_info: {
        Row: {
          asset_id: string
          created_at: string | null
          created_by: string | null
          customs_duty: number | null
          deleted_at: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          payment_method: string | null
          purchase_date: string | null
          purchase_location: string | null
          shipping_cost: number | null
          total_cost: number | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          created_by?: string | null
          customs_duty?: number | null
          deleted_at?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          payment_method?: string | null
          purchase_date?: string | null
          purchase_location?: string | null
          shipping_cost?: number | null
          total_cost?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          created_by?: string | null
          customs_duty?: number | null
          deleted_at?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          payment_method?: string | null
          purchase_date?: string | null
          purchase_location?: string | null
          shipping_cost?: number | null
          total_cost?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_info_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_info_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "asset_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      repairs: {
        Row: {
          asset_id: string
          cost: number | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          issue: string | null
          remarks: string | null
          repair_date: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
          vendor: string | null
        }
        Insert: {
          asset_id: string
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          issue?: string | null
          remarks?: string | null
          repair_date: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          vendor?: string | null
        }
        Update: {
          asset_id?: string
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          issue?: string | null
          remarks?: string | null
          repair_date?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repairs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          account_email: string | null
          amount: number
          auto_renew: boolean
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          category_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          custom_cycle_days: number | null
          dashboard_url: string | null
          exchange_rate: number | null
          id: string
          importance: Database["public"]["Enums"]["importance_level"]
          invoice_file_url: string | null
          next_renewal_amount: number | null
          next_renewal_date: string | null
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          plan_name: string | null
          provider: string
          reminder_days_before: number
          service_name: string
          start_date: string
          status: Database["public"]["Enums"]["service_status"]
          tags: string[] | null
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          account_email?: string | null
          amount: number
          auto_renew?: boolean
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          category_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          custom_cycle_days?: number | null
          dashboard_url?: string | null
          exchange_rate?: number | null
          id?: string
          importance?: Database["public"]["Enums"]["importance_level"]
          invoice_file_url?: string | null
          next_renewal_amount?: number | null
          next_renewal_date?: string | null
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          plan_name?: string | null
          provider: string
          reminder_days_before?: number
          service_name: string
          start_date: string
          status?: Database["public"]["Enums"]["service_status"]
          tags?: string[] | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          account_email?: string | null
          amount?: number
          auto_renew?: boolean
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          category_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          custom_cycle_days?: number | null
          dashboard_url?: string | null
          exchange_rate?: number | null
          id?: string
          importance?: Database["public"]["Enums"]["importance_level"]
          invoice_file_url?: string | null
          next_renewal_amount?: number | null
          next_renewal_date?: string | null
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          plan_name?: string | null
          provider?: string
          reminder_days_before?: number
          service_name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["service_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_settings: {
        Row: {
          api_key: string
          api_secret: string | null
          base_url: string | null
          created_at: string
          id: string
          is_enabled: boolean
          provider: string
          sender_id: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key: string
          api_secret?: string | null
          base_url?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          provider: string
          sender_id?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string
          api_secret?: string | null
          base_url?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          provider?: string
          sender_id?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      subscription_settings: {
        Row: {
          auto_renewal_warning_days: number
          created_at: string
          default_currency: Database["public"]["Enums"]["currency"]
          default_reminder_days: number
          id: string
          late_payment_grace_days: number
          updated_at: string
        }
        Insert: {
          auto_renewal_warning_days?: number
          created_at?: string
          default_currency?: Database["public"]["Enums"]["currency"]
          default_reminder_days?: number
          id?: string
          late_payment_grace_days?: number
          updated_at?: string
        }
        Update: {
          auto_renewal_warning_days?: number
          created_at?: string
          default_currency?: Database["public"]["Enums"]["currency"]
          default_reminder_days?: number
          id?: string
          late_payment_grace_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          application_name: string
          default_currency: string
          default_reminder_days: number
          id: string
          session_timeout_hours: number
          updated_at: string
        }
        Insert: {
          application_name?: string
          default_currency?: string
          default_reminder_days?: number
          id?: string
          session_timeout_hours?: number
          updated_at?: string
        }
        Update: {
          application_name?: string
          default_currency?: string
          default_reminder_days?: number
          id?: string
          session_timeout_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          approved_by: string | null
          asset_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          from_location_id: string | null
          id: string
          reason: string | null
          to_location_id: string | null
          transfer_date: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          asset_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          from_location_id?: string | null
          id?: string
          reason?: string | null
          to_location_id?: string | null
          transfer_date: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          approved_by?: string | null
          asset_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          from_location_id?: string | null
          id?: string
          reason?: string | null
          to_location_id?: string | null
          transfer_date?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "asset_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "asset_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          support_email: string | null
          support_phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      warranty: {
        Row: {
          asset_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          under_warranty: boolean | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
          warranty_expiry: string | null
          warranty_period_months: number | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          under_warranty?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          warranty_expiry?: string | null
          warranty_period_months?: number | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          under_warranty?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          warranty_expiry?: string | null
          warranty_period_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "warranty_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          access_token: string
          business_account_id: string | null
          created_at: string
          id: string
          is_enabled: boolean
          phone_number_id: string
          provider: string
          updated_at: string
          webhook_url: string | null
          webhook_verify_token: string | null
        }
        Insert: {
          access_token: string
          business_account_id?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          phone_number_id: string
          provider?: string
          updated_at?: string
          webhook_url?: string | null
          webhook_verify_token?: string | null
        }
        Update: {
          access_token?: string
          business_account_id?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          phone_number_id?: string
          provider?: string
          updated_at?: string
          webhook_url?: string | null
          webhook_verify_token?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_renewal_date: {
        Args: {
          start_date: string
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          custom_cycle_days?: number
        }
        Returns: string
      }
      can_manage_data: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "finance" | "viewer"
      asset_condition: "new" | "used" | "refurbished" | "damaged"
      asset_status: "in_use" | "available" | "maintenance" | "disposed" | "lost"
      attachment_kind: "invoice" | "warranty" | "manual" | "photo" | "other"
      billing_cycle:
        | "Monthly"
        | "Quarterly"
        | "Semi-Annual"
        | "Annual"
        | "Custom_days"
      currency: "INR" | "USD" | "EUR"
      day_type:
        | "working_day"
        | "weekday"
        | "weekend"
        | "holiday"
        | "disaster"
        | "event"
        | "strike"
      depreciation_method:
        | "straight_line"
        | "declining_balance"
        | "sum_of_years"
      importance_level: "Critical" | "Normal" | "Nice-to-have"
      payment_method:
        | "Card"
        | "UPI"
        | "NetBanking"
        | "Bank Transfer"
        | "PayPal"
        | "Other"
      service_category:
        | "VPS"
        | "Domain"
        | "Hosting"
        | "SSL"
        | "AI Tool"
        | "Cloud Storage"
        | "Software License"
        | "Communication"
        | "Email/Marketing"
        | "Other"
      service_status: "Active" | "Paused" | "Cancelled" | "Expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "finance", "viewer"],
      asset_condition: ["new", "used", "refurbished", "damaged"],
      asset_status: ["in_use", "available", "maintenance", "disposed", "lost"],
      attachment_kind: ["invoice", "warranty", "manual", "photo", "other"],
      billing_cycle: [
        "Monthly",
        "Quarterly",
        "Semi-Annual",
        "Annual",
        "Custom_days",
      ],
      currency: ["INR", "USD", "EUR"],
      day_type: [
        "working_day",
        "weekday",
        "weekend",
        "holiday",
        "disaster",
        "event",
        "strike",
      ],
      depreciation_method: [
        "straight_line",
        "declining_balance",
        "sum_of_years",
      ],
      importance_level: ["Critical", "Normal", "Nice-to-have"],
      payment_method: [
        "Card",
        "UPI",
        "NetBanking",
        "Bank Transfer",
        "PayPal",
        "Other",
      ],
      service_category: [
        "VPS",
        "Domain",
        "Hosting",
        "SSL",
        "AI Tool",
        "Cloud Storage",
        "Software License",
        "Communication",
        "Email/Marketing",
        "Other",
      ],
      service_status: ["Active", "Paused", "Cancelled", "Expired"],
    },
  },
} as const
