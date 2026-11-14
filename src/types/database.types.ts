export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "worker" | "customer" | "contractor" | "admin" | "institution";
export type BookingStatus = "requested" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type AvailabilityState = "available" | "on_site" | "unavailable";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: AppRole;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: AppRole;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: AppRole;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      occupations: {
        Row: {
          id: string;
          name: string;
          hindi_name: string | null;
          slug: string;
          description: string | null;
          nsqf_level: number;
          icon_name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          hindi_name?: string | null;
          slug: string;
          description?: string | null;
          nsqf_level?: number;
          icon_name?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          hindi_name?: string | null;
          slug?: string;
          description?: string | null;
          nsqf_level?: number;
          icon_name?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      skills: {
        Row: {
          id: string;
          occupation_id: string;
          name: string;
          hindi_name: string | null;
          slug: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          occupation_id: string;
          name: string;
          hindi_name?: string | null;
          slug: string;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          occupation_id?: string;
          name?: string;
          hindi_name?: string | null;
          slug?: string;
          category?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "skills_occupation_id_fkey";
            columns: ["occupation_id"];
            isOneToOne: false;
            referencedRelation: "occupations";
            referencedColumns: ["id"];
          }
        ];
      };

      worker_profiles: {
        Row: {
          id: string;
          user_id: string;
          registry_id: string;
          slug: string;
          occupation_id: string;
          headline: string;
          bio: string | null;
          years_experience: number;
          hourly_rate: number | null;
          daily_rate_min: number | null;
          daily_rate_max: number | null;
          city: string;
          state: string;
          pincode: string;
          service_radius_km: number;
          languages: string[];
          kaamscore: number;
          kaamscore_level: number;
          aadhaar_verified: boolean;
          digilocker_linked: boolean;
          is_published: boolean;
          availability_status: AvailabilityState;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          registry_id: string;
          slug?: string;
          occupation_id: string;
          headline: string;
          bio?: string | null;
          years_experience?: number;
          hourly_rate?: number | null;
          daily_rate_min?: number | null;
          daily_rate_max?: number | null;
          city: string;
          state: string;
          pincode: string;
          service_radius_km?: number;
          languages?: string[];
          kaamscore?: number;
          kaamscore_level?: number;
          aadhaar_verified?: boolean;
          digilocker_linked?: boolean;
          is_published?: boolean;
          availability_status?: AvailabilityState;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          registry_id?: string;
          slug?: string;
          occupation_id?: string;
          headline?: string;
          bio?: string | null;
          years_experience?: number;
          hourly_rate?: number | null;
          daily_rate_min?: number | null;
          daily_rate_max?: number | null;
          city?: string;
          state?: string;
          pincode?: string;
          service_radius_km?: number;
          languages?: string[];
          kaamscore?: number;
          kaamscore_level?: number;
          aadhaar_verified?: boolean;
          digilocker_linked?: boolean;
          is_published?: boolean;
          availability_status?: AvailabilityState;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "worker_profiles_occupation_id_fkey";
            columns: ["occupation_id"];
            isOneToOne: false;
            referencedRelation: "occupations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "worker_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      worker_skills: {
        Row: {
          id: string;
          worker_profile_id: string;
          skill_id: string;
          years_practiced: number | null;
          is_primary: boolean;
          verified_by_peer_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          skill_id: string;
          years_practiced?: number | null;
          is_primary?: boolean;
          verified_by_peer_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          skill_id?: string;
          years_practiced?: number | null;
          is_primary?: boolean;
          verified_by_peer_count?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "worker_skills_worker_profile_id_fkey";
            columns: ["worker_profile_id"];
            isOneToOne: false;
            referencedRelation: "worker_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "worker_skills_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          }
        ];
      };

      portfolio: {
        Row: {
          id: string;
          worker_profile_id: string;
          title: string;
          description: string | null;
          image_url: string;
          project_date: string | null;
          category: string | null;
          client_testimony: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          title: string;
          description?: string | null;
          image_url: string;
          project_date?: string | null;
          category?: string | null;
          client_testimony?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          title?: string;
          description?: string | null;
          image_url?: string;
          project_date?: string | null;
          category?: string | null;
          client_testimony?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_worker_profile_id_fkey";
            columns: ["worker_profile_id"];
            isOneToOne: false;
            referencedRelation: "worker_profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      bookings: {
        Row: {
          id: string;
          booking_reference: string;
          customer_id: string;
          worker_profile_id: string;
          service_title: string;
          description: string | null;
          location_address: string;
          location_city: string;
          scheduled_start: string;
          scheduled_end: string | null;
          estimated_cost: number | null;
          final_cost: number | null;
          status: BookingStatus;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_reference?: string;
          customer_id: string;
          worker_profile_id: string;
          service_title: string;
          description?: string | null;
          location_address: string;
          location_city: string;
          scheduled_start: string;
          scheduled_end?: string | null;
          estimated_cost?: number | null;
          final_cost?: number | null;
          status?: BookingStatus;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_reference?: string;
          customer_id?: string;
          worker_profile_id?: string;
          service_title?: string;
          description?: string | null;
          location_address?: string;
          location_city?: string;
          scheduled_start?: string;
          scheduled_end?: string | null;
          estimated_cost?: number | null;
          final_cost?: number | null;
          status?: BookingStatus;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_worker_profile_id_fkey";
            columns: ["worker_profile_id"];
            isOneToOne: false;
            referencedRelation: "worker_profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          worker_profile_id: string;
          rating: number;
          quality_rating: number | null;
          punctuality_rating: number | null;
          comment: string;
          contractor_signed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          worker_profile_id: string;
          rating: number;
          quality_rating?: number | null;
          punctuality_rating?: number | null;
          comment: string;
          contractor_signed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          customer_id?: string;
          worker_profile_id?: string;
          rating?: number;
          quality_rating?: number | null;
          punctuality_rating?: number | null;
          comment?: string;
          contractor_signed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_worker_profile_id_fkey";
            columns: ["worker_profile_id"];
            isOneToOne: false;
            referencedRelation: "worker_profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      work_records: {
        Row: {
          id: string;
          worker_profile_id: string;
          booking_id: string | null;
          project_title: string;
          contractor_or_client: string;
          location: string;
          start_date: string;
          end_date: string | null;
          is_current: boolean;
          hours_logged: number | null;
          trade_category: string;
          verified_by_contractor: boolean;
          verification_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          booking_id?: string | null;
          project_title: string;
          contractor_or_client: string;
          location: string;
          start_date: string;
          end_date?: string | null;
          is_current?: boolean;
          hours_logged?: number | null;
          trade_category: string;
          verified_by_contractor?: boolean;
          verification_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          booking_id?: string | null;
          project_title?: string;
          contractor_or_client?: string;
          location?: string;
          start_date?: string;
          end_date?: string | null;
          is_current?: boolean;
          hours_logged?: number | null;
          trade_category?: string;
          verified_by_contractor?: boolean;
          verification_hash?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_records_worker_profile_id_fkey";
            columns: ["worker_profile_id"];
            isOneToOne: false;
            referencedRelation: "worker_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_records_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };

      contractor_organizations: {
        Row: {
          id: string;
          owner_id: string;
          company_name: string;
          gstin: string | null;
          business_type: "proprietorship" | "partnership" | "private_limited" | "llp" | "individual";
          operating_city: string;
          operating_state: string;
          subscription_tier: "starter" | "pro" | "business";
          subscription_status: "active" | "past_due" | "cancelled" | "trialing";
          subscription_expires_at: string | null;
          max_roster_workers: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          company_name: string;
          gstin?: string | null;
          business_type?: "proprietorship" | "partnership" | "private_limited" | "llp" | "individual";
          operating_city: string;
          operating_state?: string;
          subscription_tier?: "starter" | "pro" | "business";
          subscription_status?: "active" | "past_due" | "cancelled" | "trialing";
          subscription_expires_at?: string | null;
          max_roster_workers?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          company_name?: string;
          gstin?: string | null;
          business_type?: "proprietorship" | "partnership" | "private_limited" | "llp" | "individual";
          operating_city?: string;
          operating_state?: string;
          subscription_tier?: "starter" | "pro" | "business";
          subscription_status?: "active" | "past_due" | "cancelled" | "trialing";
          subscription_expires_at?: string | null;
          max_roster_workers?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      contractor_workforce: {
        Row: {
          id: string;
          organization_id: string;
          worker_profile_id: string;
          status: "active" | "inactive" | "on_leave";
          project_role: string;
          daily_wage_rate: number | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          worker_profile_id: string;
          status?: "active" | "inactive" | "on_leave";
          project_role?: string;
          daily_wage_rate?: number | null;
          added_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          worker_profile_id?: string;
          status?: "active" | "inactive" | "on_leave";
          project_role?: string;
          daily_wage_rate?: number | null;
          added_at?: string;
        };
        Relationships: [];
      };

      contractor_projects: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          client_name: string;
          location: string;
          status: "planning" | "in_progress" | "completed" | "on_hold";
          budget: number | null;
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          client_name: string;
          location: string;
          status?: "planning" | "in_progress" | "completed" | "on_hold";
          budget?: number | null;
          start_date: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          client_name?: string;
          location?: string;
          status?: "planning" | "in_progress" | "completed" | "on_hold";
          budget?: number | null;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      institutions: {
        Row: {
          id: string;
          name: string;
          institution_type: "state_mission" | "vocational_iti" | "polytechnic" | "ngo" | "industry_association";
          state: string;
          district: string;
          contact_email: string;
          contact_phone: string | null;
          partner_status: "identified" | "contacted" | "in_discussion" | "pilot_proposal" | "agreement_signed" | "operational";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          institution_type: "state_mission" | "vocational_iti" | "polytechnic" | "ngo" | "industry_association";
          state?: string;
          district: string;
          contact_email: string;
          contact_phone?: string | null;
          partner_status?: "identified" | "contacted" | "in_discussion" | "pilot_proposal" | "agreement_signed" | "operational";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          institution_type?: "state_mission" | "vocational_iti" | "polytechnic" | "ngo" | "industry_association";
          state?: string;
          district?: string;
          contact_email?: string;
          contact_phone?: string | null;
          partner_status?: "identified" | "contacted" | "in_discussion" | "pilot_proposal" | "agreement_signed" | "operational";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      institutional_cohorts: {
        Row: {
          id: string;
          institution_id: string;
          name: string;
          trade: string;
          target_capacity: number;
          start_date: string;
          end_date: string | null;
          status: "upcoming" | "active" | "completed" | "archived";
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          name: string;
          trade: string;
          target_capacity?: number;
          start_date: string;
          end_date?: string | null;
          status?: "upcoming" | "active" | "completed" | "archived";
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          name?: string;
          trade?: string;
          target_capacity?: number;
          start_date?: string;
          end_date?: string | null;
          status?: "upcoming" | "active" | "completed" | "archived";
          created_at?: string;
        };
        Relationships: [];
      };

      cohort_participants: {
        Row: {
          id: string;
          cohort_id: string;
          worker_profile_id: string;
          consent_for_institution: boolean;
          training_completed: boolean;
          credential_issued: boolean;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          worker_profile_id: string;
          consent_for_institution?: boolean;
          training_completed?: boolean;
          credential_issued?: boolean;
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          worker_profile_id?: string;
          consent_for_institution?: boolean;
          training_completed?: boolean;
          credential_issued?: boolean;
          enrolled_at?: string;
        };
        Relationships: [];
      };

      abuse_reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: "worker_profile" | "review" | "booking" | "contractor";
          target_id: string;
          reason: string;
          details: string | null;
          status: "pending" | "under_review" | "resolved" | "dismissed";
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: "worker_profile" | "review" | "booking" | "contractor";
          target_id: string;
          reason: string;
          details?: string | null;
          status?: "pending" | "under_review" | "resolved" | "dismissed";
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: "worker_profile" | "review" | "booking" | "contractor";
          target_id?: string;
          reason?: string;
          details?: string | null;
          status?: "pending" | "under_review" | "resolved" | "dismissed";
          created_at?: string;
        };
        Relationships: [];
      };

      profile_corrections: {
        Row: {
          id: string;
          worker_profile_id: string;
          requested_by: string;
          field_name: string;
          correction_reason: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          requested_by: string;
          field_name: string;
          correction_reason: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          requested_by?: string;
          field_name?: string;
          correction_reason?: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_worker_profile_slug: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      app_role: AppRole;
      booking_status: BookingStatus;
      availability_state: AvailabilityState;
    };
  };
}

// Convenient row aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Occupation = Database["public"]["Tables"]["occupations"]["Row"];
export type Skill = Database["public"]["Tables"]["skills"]["Row"];
export type WorkerProfile = Database["public"]["Tables"]["worker_profiles"]["Row"];
export type WorkerSkill = Database["public"]["Tables"]["worker_skills"]["Row"];
export type PortfolioItem = Database["public"]["Tables"]["portfolio"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type WorkRecord = Database["public"]["Tables"]["work_records"]["Row"];
export type ContractorOrganization = Database["public"]["Tables"]["contractor_organizations"]["Row"];
export type ContractorWorkforce = Database["public"]["Tables"]["contractor_workforce"]["Row"];
export type ContractorProject = Database["public"]["Tables"]["contractor_projects"]["Row"];
export type Institution = Database["public"]["Tables"]["institutions"]["Row"];
export type InstitutionalCohort = Database["public"]["Tables"]["institutional_cohorts"]["Row"];
export type CohortParticipant = Database["public"]["Tables"]["cohort_participants"]["Row"];
export type AbuseReport = Database["public"]["Tables"]["abuse_reports"]["Row"];
export type ProfileCorrection = Database["public"]["Tables"]["profile_corrections"]["Row"];
