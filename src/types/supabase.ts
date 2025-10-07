export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      subscription_alternatives: {
        Row: {
          created_at: string | null
          id: string
          service_name: string
          subscription_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_name: string
          subscription_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          service_name?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_alternatives_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "active_subscriptions_monthly_cost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_alternatives_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_alternatives_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_alternatives_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_full"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_name: string
          key_value: string
          subscription_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_name: string
          key_value: string
          subscription_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_name?: string
          key_value?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_api_keys_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "active_subscriptions_monthly_cost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_api_keys_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_api_keys_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_api_keys_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_full"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_previous_accountemails: {
        Row: {
          email: string
          id: string
          subscription_id: string
          used_at: string | null
        }
        Insert: {
          email: string
          id?: string
          subscription_id: string
          used_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          subscription_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_account_emails_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "active_subscriptions_monthly_cost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_account_emails_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_account_emails_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_account_emails_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_full"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_previous_promocodes: {
        Row: {
          id: string
          promo_code: string
          subscription_id: string
          used_at: string | null
        }
        Insert: {
          id?: string
          promo_code: string
          subscription_id: string
          used_at?: string | null
        }
        Update: {
          id?: string
          promo_code?: string
          subscription_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_promo_codes_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "active_subscriptions_monthly_cost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_promo_codes_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_promo_codes_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_promo_codes_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_full"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tags: {
        Row: {
          created_at: string | null
          id: string
          subscription_id: string
          tag: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          subscription_id: string
          tag: string
        }
        Update: {
          created_at?: string | null
          id?: string
          subscription_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_tags_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "active_subscriptions_monthly_cost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_tags_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_tags_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_tags_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_full"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          a16z_rank: number | null
          account_email: string | null
          auto_renew: boolean | null
          billing_cycle: string
          category: string
          china_region_only: boolean | null
          cost: number
          created_at: string | null
          currency: string | null
          description: string | null
          fallback_icon: string | null
          id: string
          last_used: string | null
          latest_promocode: string | null
          logo_url: string | null
          name: string
          notes: string | null
          plan: string | null
          promo_code: string | null
          promo_discount: number | null
          renewal_date: string
          safe_for_work: boolean | null
          secret_key: string | null
          start_date: string
          status: string
          subcategory: string | null
          updated_at: string | null
          url: string | null
          usage_frequency: string | null
          usage_importance: string
        }
        Insert: {
          a16z_rank?: number | null
          account_email?: string | null
          auto_renew?: boolean | null
          billing_cycle?: string
          category?: string
          china_region_only?: boolean | null
          cost?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          fallback_icon?: string | null
          id?: string
          last_used?: string | null
          latest_promocode?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          plan?: string | null
          promo_code?: string | null
          promo_discount?: number | null
          renewal_date?: string
          safe_for_work?: boolean | null
          secret_key?: string | null
          start_date?: string
          status?: string
          subcategory?: string | null
          updated_at?: string | null
          url?: string | null
          usage_frequency?: string | null
          usage_importance?: string
        }
        Update: {
          a16z_rank?: number | null
          account_email?: string | null
          auto_renew?: boolean | null
          billing_cycle?: string
          category?: string
          china_region_only?: boolean | null
          cost?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          fallback_icon?: string | null
          id?: string
          last_used?: string | null
          latest_promocode?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          plan?: string | null
          promo_code?: string | null
          promo_discount?: number | null
          renewal_date?: string
          safe_for_work?: boolean | null
          secret_key?: string | null
          start_date?: string
          status?: string
          subcategory?: string | null
          updated_at?: string | null
          url?: string | null
          usage_frequency?: string | null
          usage_importance?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          updated_at: string | null
          url_state: Json | null
          user_id: string | null
          view_mode: Json | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          updated_at?: string | null
          url_state?: Json | null
          user_id?: string | null
          view_mode?: Json | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          updated_at?: string | null
          url_state?: Json | null
          user_id?: string | null
          view_mode?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      active_subscriptions_monthly_cost: {
        Row: {
          billing_cycle: string | null
          category: string | null
          cost: number | null
          currency: string | null
          id: string | null
          monthly_cost: number | null
          name: string | null
          priority: string | null
          renewal_date: string | null
          usage_frequency: string | null
        }
        Insert: {
          billing_cycle?: string | null
          category?: string | null
          cost?: number | null
          currency?: string | null
          id?: string | null
          monthly_cost?: never
          name?: string | null
          priority?: string | null
          renewal_date?: string | null
          usage_frequency?: string | null
        }
        Update: {
          billing_cycle?: string | null
          category?: string | null
          cost?: number | null
          currency?: string | null
          id?: string | null
          monthly_cost?: never
          name?: string | null
          priority?: string | null
          renewal_date?: string | null
          usage_frequency?: string | null
        }
        Relationships: []
      }
      subscriptions_expiring_soon: {
        Row: {
          a16z_rank: number | null
          account_email: string | null
          auto_renew: boolean | null
          billing_cycle: string | null
          category: string | null
          china_region_only: boolean | null
          cost: number | null
          created_at: string | null
          currency: string | null
          days_until_renewal: unknown | null
          description: string | null
          fallback_icon: string | null
          id: string | null
          last_used: string | null
          latest_promocode: string | null
          logo_url: string | null
          name: string | null
          notes: string | null
          plan: string | null
          promo_code: string | null
          promo_discount: number | null
          renewal_date: string | null
          safe_for_work: boolean | null
          secret_key: string | null
          start_date: string | null
          status: string | null
          subcategory: string | null
          updated_at: string | null
          url: string | null
          usage_frequency: string | null
          usage_importance: string | null
        }
        Insert: {
          a16z_rank?: number | null
          account_email?: string | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          category?: string | null
          china_region_only?: boolean | null
          cost?: number | null
          created_at?: string | null
          currency?: string | null
          days_until_renewal?: never
          description?: string | null
          fallback_icon?: string | null
          id?: string | null
          last_used?: string | null
          latest_promocode?: string | null
          logo_url?: string | null
          name?: string | null
          notes?: string | null
          plan?: string | null
          promo_code?: string | null
          promo_discount?: number | null
          renewal_date?: string | null
          safe_for_work?: boolean | null
          secret_key?: string | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          url?: string | null
          usage_frequency?: string | null
          usage_importance?: string | null
        }
        Update: {
          a16z_rank?: number | null
          account_email?: string | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          category?: string | null
          china_region_only?: boolean | null
          cost?: number | null
          created_at?: string | null
          currency?: string | null
          days_until_renewal?: never
          description?: string | null
          fallback_icon?: string | null
          id?: string | null
          last_used?: string | null
          latest_promocode?: string | null
          logo_url?: string | null
          name?: string | null
          notes?: string | null
          plan?: string | null
          promo_code?: string | null
          promo_discount?: number | null
          renewal_date?: string | null
          safe_for_work?: boolean | null
          secret_key?: string | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          url?: string | null
          usage_frequency?: string | null
          usage_importance?: string | null
        }
        Relationships: []
      }
      subscriptions_full: {
        Row: {
          a16z_rank: number | null
          account_email: string | null
          alternatives: Json | null
          api_keys: Json | null
          auto_renew: boolean | null
          billing_cycle: string | null
          category: string | null
          china_region_only: boolean | null
          cost: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          emails: Json | null
          fallback_icon: string | null
          id: string | null
          last_used: string | null
          latest_promocode: string | null
          logo_url: string | null
          name: string | null
          notes: string | null
          plan: string | null
          promo_code: string | null
          promo_discount: number | null
          promotions: Json | null
          renewal_date: string | null
          safe_for_work: boolean | null
          secret_key: string | null
          start_date: string | null
          status: string | null
          subcategory: string | null
          tags: Json | null
          updated_at: string | null
          url: string | null
          usage_frequency: string | null
          usage_importance: string | null
        }
        Insert: {
          a16z_rank?: number | null
          account_email?: string | null
          alternatives?: never
          api_keys?: never
          auto_renew?: boolean | null
          billing_cycle?: string | null
          category?: string | null
          china_region_only?: boolean | null
          cost?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          emails?: never
          fallback_icon?: string | null
          id?: string | null
          last_used?: string | null
          latest_promocode?: string | null
          logo_url?: string | null
          name?: string | null
          notes?: string | null
          plan?: string | null
          promo_code?: string | null
          promo_discount?: number | null
          promotions?: never
          renewal_date?: string | null
          safe_for_work?: boolean | null
          secret_key?: string | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: never
          updated_at?: string | null
          url?: string | null
          usage_frequency?: string | null
          usage_importance?: string | null
        }
        Update: {
          a16z_rank?: number | null
          account_email?: string | null
          alternatives?: never
          api_keys?: never
          auto_renew?: boolean | null
          billing_cycle?: string | null
          category?: string | null
          china_region_only?: boolean | null
          cost?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          emails?: never
          fallback_icon?: string | null
          id?: string | null
          last_used?: string | null
          latest_promocode?: string | null
          logo_url?: string | null
          name?: string | null
          notes?: string | null
          plan?: string | null
          promo_code?: string | null
          promo_discount?: number | null
          promotions?: never
          renewal_date?: string | null
          safe_for_work?: boolean | null
          secret_key?: string | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: never
          updated_at?: string | null
          url?: string | null
          usage_frequency?: string | null
          usage_importance?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_total_monthly_cost: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_category_breakdown: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          count: number
          total_cost: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

