export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          applicant_id: string;
          applied_at: string;
          cover_letter: string | null;
          employer_notes: string | null;
          id: string;
          job_id: string;
          resume_path: string | null;
          status: Database["public"]["Enums"]["application_status"];
          updated_at: string;
        };
        Insert: {
          applicant_id: string;
          applied_at?: string;
          cover_letter?: string | null;
          employer_notes?: string | null;
          id?: string;
          job_id: string;
          resume_path?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          updated_at?: string;
        };
        Update: {
          applicant_id?: string;
          applied_at?: string;
          cover_letter?: string | null;
          employer_notes?: string | null;
          id?: string;
          job_id?: string;
          resume_path?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          details: Json | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          ip: string | null;
          metadata: Json;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          details?: Json | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip?: string | null;
          metadata?: Json;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          details?: Json | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip?: string | null;
          metadata?: Json;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          company_size: string | null;
          created_at: string;
          description: string | null;
          email: string | null;
          id: string;
          industry: string | null;
          is_verified: boolean;
          location: string | null;
          logo_path: string | null;
          logo_url: string | null;
          name: string;
          owner_id: string;
          phone: string | null;
          region: string | null;
          slug: string;
          updated_at: string;
          verification_notes: string | null;
          verification_status: Database["public"]["Enums"]["verification_status"];
          verified_at: string | null;
          verified_by: string | null;
          website: string | null;
        };
        Insert: {
          company_size?: string | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          industry?: string | null;
          is_verified?: boolean;
          location?: string | null;
          logo_path?: string | null;
          logo_url?: string | null;
          name: string;
          owner_id: string;
          phone?: string | null;
          region?: string | null;
          slug: string;
          updated_at?: string;
          verification_notes?: string | null;
          verification_status?: Database["public"]["Enums"]["verification_status"];
          verified_at?: string | null;
          verified_by?: string | null;
          website?: string | null;
        };
        Update: {
          company_size?: string | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          industry?: string | null;
          is_verified?: boolean;
          location?: string | null;
          logo_path?: string | null;
          logo_url?: string | null;
          name?: string;
          owner_id?: string;
          phone?: string | null;
          region?: string | null;
          slug?: string;
          updated_at?: string;
          verification_notes?: string | null;
          verification_status?: Database["public"]["Enums"]["verification_status"];
          verified_at?: string | null;
          verified_by?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      company_members: {
        Row: {
          company_id: string;
          created_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          id?: string;
          role?: string;
          user_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      job_categories: {
        Row: {
          active: boolean;
          created_at: string;
          description_en: string | null;
          description_sw: string | null;
          icon: string | null;
          id: string;
          name_en: string;
          name_sw: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          description_en?: string | null;
          description_sw?: string | null;
          icon?: string | null;
          id?: string;
          name_en: string;
          name_sw: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          description_en?: string | null;
          description_sw?: string | null;
          icon?: string | null;
          id?: string;
          name_en?: string;
          name_sw?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      job_skills: {
        Row: {
          id: string;
          job_id: string;
          skill: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          skill: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          skill?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          application_deadline: string | null;
          applications_count: number;
          category_id: string | null;
          company_id: string;
          created_at: string;
          currency: string;
          description: string;
          employment_type: Database["public"]["Enums"]["employment_type"];
          experience_level: Database["public"]["Enums"]["experience_level"];
          id: string;
          is_featured: boolean;
          is_remote: boolean;
          is_urgent: boolean;
          location: string | null;
          posted_by: string;
          published_at: string | null;
          region: string | null;
          requirements: string | null;
          responsibilities: string | null;
          salary_max: number | null;
          salary_min: number | null;
          slug: string;
          status: Database["public"]["Enums"]["job_status"];
          title: string;
          updated_at: string;
          views_count: number;
        };
        Insert: {
          application_deadline?: string | null;
          applications_count?: number;
          category_id?: string | null;
          company_id: string;
          created_at?: string;
          currency?: string;
          description: string;
          employment_type?: Database["public"]["Enums"]["employment_type"];
          experience_level?: Database["public"]["Enums"]["experience_level"];
          id?: string;
          is_featured?: boolean;
          is_remote?: boolean;
          is_urgent?: boolean;
          location?: string | null;
          posted_by: string;
          published_at?: string | null;
          region?: string | null;
          requirements?: string | null;
          responsibilities?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          slug: string;
          status?: Database["public"]["Enums"]["job_status"];
          title: string;
          updated_at?: string;
          views_count?: number;
        };
        Update: {
          application_deadline?: string | null;
          applications_count?: number;
          category_id?: string | null;
          company_id?: string;
          created_at?: string;
          currency?: string;
          description?: string;
          employment_type?: Database["public"]["Enums"]["employment_type"];
          experience_level?: Database["public"]["Enums"]["experience_level"];
          id?: string;
          is_featured?: boolean;
          is_remote?: boolean;
          is_urgent?: boolean;
          location?: string | null;
          posted_by?: string;
          published_at?: string | null;
          region?: string | null;
          requirements?: string | null;
          responsibilities?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          slug?: string;
          status?: Database["public"]["Enums"]["job_status"];
          title?: string;
          updated_at?: string;
          views_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "job_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          bio: string | null;
          created_at: string;
          full_name: string | null;
          headline: string | null;
          id: string;
          location: string | null;
          phone: string | null;
          preferred_language: Database["public"]["Enums"]["language_code"];
          updated_at: string;
        };
        Insert: {
          avatar_path?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          headline?: string | null;
          id: string;
          location?: string | null;
          phone?: string | null;
          preferred_language?: Database["public"]["Enums"]["language_code"];
          updated_at?: string;
        };
        Update: {
          avatar_path?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          headline?: string | null;
          id?: string;
          location?: string | null;
          phone?: string | null;
          preferred_language?: Database["public"]["Enums"]["language_code"];
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_jobs: {
        Row: {
          job_id: string;
          saved_at: string;
          user_id: string;
        };
        Insert: {
          job_id: string;
          saved_at?: string;
          user_id: string;
        };
        Update: {
          job_id?: string;
          saved_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      account_verifications: {
        Row: {
          created_at: string;
          id: string;
          id_number: string;
          id_type: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["verification_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          id_number: string;
          id_type: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          id_number?: string;
          id_type?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_duplicate_jobs: {
        Row: {
          created_at: string;
          existing_job_id: string;
          id: string;
          job_id: string;
          similarity_score: number;
          status: string;
        };
        Insert: {
          created_at?: string;
          existing_job_id: string;
          id?: string;
          job_id: string;
          similarity_score: number;
          status?: string;
        };
        Update: {
          created_at?: string;
          existing_job_id?: string;
          id?: string;
          job_id?: string;
          similarity_score?: number;
          status?: string;
        };
        Relationships: [];
      };
      ai_fraud_flags: {
        Row: {
          created_at: string;
          details: Json;
          entity_id: string;
          entity_type: string;
          flag_type: string;
          id: string;
          reason: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          risk_score: number;
          status: string;
        };
        Insert: {
          created_at?: string;
          details?: Json;
          entity_id: string;
          entity_type: string;
          flag_type: string;
          id?: string;
          reason: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          risk_score?: number;
          status?: string;
        };
        Update: {
          created_at?: string;
          details?: Json;
          entity_id?: string;
          entity_type?: string;
          flag_type?: string;
          id?: string;
          reason?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          risk_score?: number;
          status?: string;
        };
        Relationships: [];
      };
      ai_prompt_templates: {
        Row: {
          description: string | null;
          is_active: boolean;
          key: string;
          model_alias: string;
          provider: string;
          template: string;
          updated_at: string;
        };
        Insert: {
          description?: string | null;
          is_active?: boolean;
          key: string;
          model_alias?: string;
          provider?: string;
          template: string;
          updated_at?: string;
        };
        Update: {
          description?: string | null;
          is_active?: boolean;
          key?: string;
          model_alias?: string;
          provider?: string;
          template?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      login_history: {
        Row: {
          created_at: string;
          email: string | null;
          failure_reason: string | null;
          id: string;
          ip_address: string | null;
          status: string;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          failure_reason?: string | null;
          id?: string;
          ip_address?: string | null;
          status: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          failure_reason?: string | null;
          id?: string;
          ip_address?: string | null;
          status?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      saved_searches: {
        Row: {
          created_at: string;
          filters: Json;
          id: string;
          name: string;
          notify_email: boolean;
          query_text: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          filters?: Json;
          id?: string;
          name: string;
          notify_email?: boolean;
          query_text?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          filters?: Json;
          id?: string;
          name?: string;
          notify_email?: boolean;
          query_text?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      search_history: {
        Row: {
          created_at: string;
          filters: Json;
          id: string;
          language: string | null;
          query_text: string;
          results_count: number;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          filters?: Json;
          id?: string;
          language?: string | null;
          query_text: string;
          results_count?: number;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          filters?: Json;
          id?: string;
          language?: string | null;
          query_text?: string;
          results_count?: number;
          user_id?: string | null;
        };
        Relationships: [];
      };
      search_synonyms: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          language: string;
          synonyms: string[];
          term: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          language?: string;
          synonyms: string[];
          term: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          language?: string;
          synonyms?: string[];
          term?: string;
        };
        Relationships: [];
      };
      security_alerts: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          metadata: Json | null;
          severity: string;
          status: string;
          title: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          metadata?: Json | null;
          severity: string;
          status?: string;
          title: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          metadata?: Json | null;
          severity?: string;
          status?: string;
          title?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      trending_searches: {
        Row: {
          category: string | null;
          id: string;
          last_searched_at: string;
          search_count: number;
          term: string;
        };
        Insert: {
          category?: string | null;
          id?: string;
          last_searched_at?: string;
          search_count?: number;
          term: string;
        };
        Update: {
          category?: string | null;
          id?: string;
          last_searched_at?: string;
          search_count?: number;
          term?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          email_notifications: boolean;
          email_verified: boolean;
          mfa_enabled: boolean;
          phone_verified: boolean;
          sms_notifications: boolean;
          theme: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          email_notifications?: boolean;
          email_verified?: boolean;
          mfa_enabled?: boolean;
          phone_verified?: boolean;
          sms_notifications?: boolean;
          theme?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          email_notifications?: boolean;
          email_verified?: boolean;
          mfa_enabled?: boolean;
          phone_verified?: boolean;
          sms_notifications?: boolean;
          theme?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_skills: {
        Row: {
          created_at: string;
          id: string;
          proficiency: string;
          skill: string;
          source: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          proficiency?: string;
          skill: string;
          source?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          proficiency?: string;
          skill?: string;
          source?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          granted_by: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          granted_by?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          granted_by?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_manage_company: {
        Args: { _company_id: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role:
        "super_admin" | "admin" | "moderator" | "employer" | "recruiter" | "job_seeker" | "support";
      application_status:
        | "submitted"
        | "reviewing"
        | "shortlisted"
        | "interview"
        | "offered"
        | "hired"
        | "rejected"
        | "withdrawn";
      employment_type:
        "full_time" | "part_time" | "contract" | "internship" | "temporary" | "freelance";
      experience_level: "entry" | "junior" | "mid" | "senior" | "lead" | "executive";
      job_status: "draft" | "published" | "closed" | "archived";
      language_code: "en" | "sw";
      verification_status: "pending" | "verified" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "moderator",
        "employer",
        "recruiter",
        "job_seeker",
        "support",
      ],
      application_status: [
        "submitted",
        "reviewing",
        "shortlisted",
        "interview",
        "offered",
        "hired",
        "rejected",
        "withdrawn",
      ],
      employment_type: [
        "full_time",
        "part_time",
        "contract",
        "internship",
        "temporary",
        "freelance",
      ],
      experience_level: ["entry", "junior", "mid", "senior", "lead", "executive"],
      job_status: ["draft", "published", "closed", "archived"],
      language_code: ["en", "sw"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const;
