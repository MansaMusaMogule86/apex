// =====================================================================
// APEX · Database Types
// Generated to match supabase/migrations/*. Update via:
//   npx supabase gen types typescript --project-id <id> --schema public
// =====================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClientTier = "prestige" | "elite" | "bespoke";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CampaignInfStatus = "proposed" | "contracted" | "live" | "complete";
export type UserRole =
  | "super_admin"
  | "admin"
  | "account_manager"
  | "client_owner"
  | "client_viewer";
export type LeadStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "client"
  | "retained";
export type AccessRequestPriority = "critical" | "high" | "medium" | "watch";
export type AccessRequestStatus =
  | "submitted"
  | "processing"
  | "executive_review"
  | "executive_call"
  | "approved"
  | "waitlisted"
  | "declined";
export type ReportType = "monthly" | "weekly" | "campaign" | "adhoc";
export type NotificationType = "success" | "info" | "error" | "ai_insight";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          client_id: string | null;
          mfa_enabled: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          client_id?: string | null;
          mfa_enabled?: boolean;
          last_seen_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          org_name: string;
          tier: ClientTier;
          apex_score: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          brand_guidelines: Json | null;
          metadata: Json;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_name: string;
          tier?: ClientTier;
          apex_score?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          brand_guidelines?: Json | null;
          metadata?: Json;
          owner_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      influencers: {
        Row: {
          id: string;
          handle: string;
          display_name: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          platform: string[];
          apex_score: number;
          followers_total: number;
          engagement_rate: number;
          location: string | null;
          niches: string[];
          languages: string[];
          ai_notes: Json | null;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          handle: string;
          display_name?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          platform?: string[];
          apex_score?: number;
          followers_total?: number;
          engagement_rate?: number;
          location?: string | null;
          niches?: string[];
          languages?: string[];
          ai_notes?: Json | null;
          embedding?: number[] | null;
        };
        Update: Partial<Database["public"]["Tables"]["influencers"]["Insert"]>;
      };
      campaigns: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          status: CampaignStatus;
          budget: number;
          start_date: string | null;
          end_date: string | null;
          kpis: Json;
          ai_brief: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          status?: CampaignStatus;
          budget?: number;
          start_date?: string | null;
          end_date?: string | null;
          kpis?: Json;
          ai_brief?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
      };
      campaign_influencers: {
        Row: {
          campaign_id: string;
          influencer_id: string;
          fee: number;
          deliverables: Json;
          status: CampaignInfStatus;
          metrics: Json;
          created_at: string;
        };
        Insert: {
          campaign_id: string;
          influencer_id: string;
          fee?: number;
          deliverables?: Json;
          status?: CampaignInfStatus;
          metrics?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["campaign_influencers"]["Insert"]>;
      };
      leads: {
        Row: {
          id: string;
          client_id: string | null;
          name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          stage: LeadStage;
          value: number;
          source: string | null;
          ai_next_action: string | null;
          last_touch_at: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          stage?: LeadStage;
          value?: number;
          source?: string | null;
          ai_next_action?: string | null;
          last_touch_at?: string | null;
          owner_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      apex_applications: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string;
          email: string;
          company: string;
          industry: string;
          website: string | null;
          linkedin: string | null;
          revenue_range: string;
          market_focus: string;
          strategic_objective: string;
          why_apex: string;
          prestige_score: number | null;
          authority_score: number | null;
          market_potential_score: number | null;
          luxury_fit_score: number | null;
          priority_level: AccessRequestPriority;
          ai_summary: string | null;
          ai_recommendation: string | null;
          status: AccessRequestStatus;
          executive_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          full_name: string;
          email: string;
          company: string;
          industry: string;
          website?: string | null;
          linkedin?: string | null;
          revenue_range: string;
          market_focus: string;
          strategic_objective: string;
          why_apex: string;
          prestige_score?: number | null;
          authority_score?: number | null;
          market_potential_score?: number | null;
          luxury_fit_score?: number | null;
          priority_level?: AccessRequestPriority;
          ai_summary?: string | null;
          ai_recommendation?: string | null;
          status?: AccessRequestStatus;
          executive_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["apex_applications"]["Insert"]>;
      };
      ai_reports: {
        Row: {
          id: string;
          client_id: string;
          type: ReportType;
          title: string;
          content: Json;
          pdf_url: string | null;
          generated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          type: ReportType;
          title: string;
          content: Json;
          pdf_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ai_reports"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          href: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: NotificationType;
          title: string;
          body?: string | null;
          href?: string | null;
          read_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      audit_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: Json;
          ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          metadata?: Json;
          ip?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      fn_role: { Args: Record<string, never>; Returns: UserRole };
      fn_client_id: { Args: Record<string, never>; Returns: string | null };
      fn_is_admin: { Args: Record<string, never>; Returns: boolean };
      fn_is_staff: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      client_tier: ClientTier;
      campaign_status: CampaignStatus;
      campaign_inf_status: CampaignInfStatus;
      user_role: UserRole;
      lead_stage: LeadStage;
      access_request_priority: AccessRequestPriority;
      access_request_status: AccessRequestStatus;
      report_type: ReportType;
      notification_type: NotificationType;
    };
  };
}

// Convenience aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Influencer = Database["public"]["Tables"]["influencers"]["Row"];
export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignInfluencer =
  Database["public"]["Tables"]["campaign_influencers"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type ApexApplication = Database["public"]["Tables"]["apex_applications"]["Row"];
export type AIReport = Database["public"]["Tables"]["ai_reports"]["Row"];
export type Notification =
  Database["public"]["Tables"]["notifications"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];
