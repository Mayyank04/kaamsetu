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
          travel_willingness: "same_district" | "adjacent_districts" | "interstate" | "remote_only";
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
          travel_willingness?: "same_district" | "adjacent_districts" | "interstate" | "remote_only";
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
          travel_willingness?: "same_district" | "adjacent_districts" | "interstate" | "remote_only";
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
          is_public_on_roster: boolean;
          invitation_id: string | null;
          joined_at: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          worker_profile_id: string;
          status?: "active" | "inactive" | "on_leave";
          project_role?: string;
          daily_wage_rate?: number | null;
          is_public_on_roster?: boolean;
          invitation_id?: string | null;
          joined_at?: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          worker_profile_id?: string;
          status?: "active" | "inactive" | "on_leave";
          project_role?: string;
          daily_wage_rate?: number | null;
          is_public_on_roster?: boolean;
          invitation_id?: string | null;
          joined_at?: string;
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
          verification_status: "registered" | "in_review" | "verified" | "rejected" | "suspended";
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
          verification_status?: "registered" | "in_review" | "verified" | "rejected" | "suspended";
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
          verification_status?: "registered" | "in_review" | "verified" | "rejected" | "suspended";
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
          lifecycle_stage: "enrolled" | "training_in_progress" | "assessment_attempted" | "assessment_passed" | "credential_issued" | "employer_introduced" | "placement_confirmed";
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          worker_profile_id: string;
          consent_for_institution?: boolean;
          training_completed?: boolean;
          credential_issued?: boolean;
          lifecycle_stage?: "enrolled" | "training_in_progress" | "assessment_attempted" | "assessment_passed" | "credential_issued" | "employer_introduced" | "placement_confirmed";
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          worker_profile_id?: string;
          consent_for_institution?: boolean;
          training_completed?: boolean;
          credential_issued?: boolean;
          lifecycle_stage?: "enrolled" | "training_in_progress" | "assessment_attempted" | "assessment_passed" | "credential_issued" | "employer_introduced" | "placement_confirmed";
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

      workforce_invitations: {
        Row: {
          id: string;
          organization_id: string;
          worker_profile_id: string;
          invited_by: string;
          proposed_role: string;
          proposed_daily_wage: number | null;
          message: string | null;
          status: "pending" | "accepted" | "rejected" | "cancelled" | "expired";
          token: string;
          expires_at: string;
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          worker_profile_id: string;
          invited_by: string;
          proposed_role?: string;
          proposed_daily_wage?: number | null;
          message?: string | null;
          status?: "pending" | "accepted" | "rejected" | "cancelled" | "expired";
          token?: string;
          expires_at?: string;
          responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          worker_profile_id?: string;
          invited_by?: string;
          proposed_role?: string;
          proposed_daily_wage?: number | null;
          message?: string | null;
          status?: "pending" | "accepted" | "rejected" | "cancelled" | "expired";
          token?: string;
          expires_at?: string;
          responded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      subscription_orders: {
        Row: {
          id: string;
          organization_id: string;
          order_reference: string;
          plan_tier: "starter" | "pro" | "business";
          billing_cycle: "monthly" | "annual";
          base_amount: number;
          gst_amount: number;
          total_amount: number;
          currency: string;
          payment_gateway: "sandbox" | "razorpay" | "stripe" | "manual_invoice";
          gateway_order_id: string | null;
          gateway_payment_id: string | null;
          gateway_signature: string | null;
          status: "created" | "pending" | "authorized" | "captured" | "failed" | "refunded";
          invoice_url: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          order_reference: string;
          plan_tier: "starter" | "pro" | "business";
          billing_cycle?: "monthly" | "annual";
          base_amount: number;
          gst_amount: number;
          total_amount: number;
          currency?: string;
          payment_gateway?: "sandbox" | "razorpay" | "stripe" | "manual_invoice";
          gateway_order_id?: string | null;
          gateway_payment_id?: string | null;
          gateway_signature?: string | null;
          status?: "created" | "pending" | "authorized" | "captured" | "failed" | "refunded";
          invoice_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          order_reference?: string;
          plan_tier?: "starter" | "pro" | "business";
          billing_cycle?: "monthly" | "annual";
          base_amount?: number;
          gst_amount?: number;
          total_amount?: number;
          currency?: string;
          payment_gateway?: "sandbox" | "razorpay" | "stripe" | "manual_invoice";
          gateway_order_id?: string | null;
          gateway_payment_id?: string | null;
          gateway_signature?: string | null;
          status?: "created" | "pending" | "authorized" | "captured" | "failed" | "refunded";
          invoice_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      cohort_trainee_progress: {
        Row: {
          id: string;
          participant_id: string;
          module_name: string;
          hours_attended: number;
          assessment_score: number | null;
          practical_demonstration_verified: boolean;
          evaluator_name: string | null;
          placement_status: "training" | "completed" | "placed" | "self_employed" | "seeking_opportunity";
          employer_or_contractor_name: string | null;
          monthly_stipend_or_wage: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          module_name: string;
          hours_attended?: number;
          assessment_score?: number | null;
          practical_demonstration_verified?: boolean;
          evaluator_name?: string | null;
          placement_status?: "training" | "completed" | "placed" | "self_employed" | "seeking_opportunity";
          employer_or_contractor_name?: string | null;
          monthly_stipend_or_wage?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          module_name?: string;
          hours_attended?: number;
          assessment_score?: number | null;
          practical_demonstration_verified?: boolean;
          evaluator_name?: string | null;
          placement_status?: "training" | "completed" | "placed" | "self_employed" | "seeking_opportunity";
          employer_or_contractor_name?: string | null;
          monthly_stipend_or_wage?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      institution_audit_logs: {
        Row: {
          id: string;
          institution_id: string;
          actor_id: string;
          action: string;
          target_type: string;
          target_id: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          actor_id: string;
          action: string;
          target_type: string;
          target_id: string;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          actor_id?: string;
          action?: string;
          target_type?: string;
          target_id?: string;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };

      crm_contractor_leads: {
        Row: {
          id: string;
          prospect_code: string;
          organization_name: string;
          contact_name: string;
          contact_phone: string | null;
          district: string;
          stage: "lead" | "contacted" | "qualified" | "demo_scheduled" | "demo_completed" | "trial_active" | "payment_pending" | "paid" | "lost" | "follow_up_required";
          plan_pitch: "starter" | "pro" | "business";
          willingness_to_pay: boolean;
          roster_size_estimated: number;
          notes: string | null;
          converted_organization_id: string | null;
          converted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prospect_code: string;
          organization_name: string;
          contact_name: string;
          contact_phone?: string | null;
          district?: string;
          stage?: "lead" | "contacted" | "qualified" | "demo_scheduled" | "demo_completed" | "trial_active" | "payment_pending" | "paid" | "lost" | "follow_up_required";
          plan_pitch?: "starter" | "pro" | "business";
          willingness_to_pay?: boolean;
          roster_size_estimated?: number;
          notes?: string | null;
          converted_organization_id?: string | null;
          converted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prospect_code?: string;
          organization_name?: string;
          contact_name?: string;
          contact_phone?: string | null;
          district?: string;
          stage?: "lead" | "contacted" | "qualified" | "demo_scheduled" | "demo_completed" | "trial_active" | "payment_pending" | "paid" | "lost" | "follow_up_required";
          plan_pitch?: "starter" | "pro" | "business";
          willingness_to_pay?: boolean;
          roster_size_estimated?: number;
          notes?: string | null;
          converted_organization_id?: string | null;
          converted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      payment_webhook_events: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          payment_gateway: string;
          payload: Json;
          status: "received" | "processed" | "ignored" | "failed";
          error_message: string | null;
          processed_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          event_type: string;
          payment_gateway?: string;
          payload?: Json;
          status?: "received" | "processed" | "ignored" | "failed";
          error_message?: string | null;
          processed_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          event_type?: string;
          payment_gateway?: string;
          payload?: Json;
          status?: "received" | "processed" | "ignored" | "failed";
          error_message?: string | null;
          processed_at?: string;
        };
        Relationships: [];
      };

      worker_association_events: {
        Row: {
          id: string;
          worker_id: string;
          organization_id: string;
          action: "joined" | "hidden" | "made_public" | "withdrawn" | "revoked";
          actor_user_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          organization_id: string;
          action: "joined" | "hidden" | "made_public" | "withdrawn" | "revoked";
          actor_user_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          organization_id?: string;
          action?: "joined" | "hidden" | "made_public" | "withdrawn" | "revoked";
          actor_user_id?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      contractor_team_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "owner" | "project_supervisor" | "site_thekedaar" | "finance_admin";
          permissions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: "owner" | "project_supervisor" | "site_thekedaar" | "finance_admin";
          permissions?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: "owner" | "project_supervisor" | "site_thekedaar" | "finance_admin";
          permissions?: Json;
          created_at?: string;
        };
        Relationships: [];
      };

      project_crew_assignments: {
        Row: {
          id: string;
          project_id: string;
          workforce_id: string;
          assigned_by: string;
          assigned_role: string;
          start_date: string;
          end_date: string | null;
          status: "scheduled" | "active" | "completed" | "released";
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          workforce_id: string;
          assigned_by: string;
          assigned_role: string;
          start_date?: string;
          end_date?: string | null;
          status?: "scheduled" | "active" | "completed" | "released";
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          workforce_id?: string;
          assigned_by?: string;
          assigned_role?: string;
          start_date?: string;
          end_date?: string | null;
          status?: "scheduled" | "active" | "completed" | "released";
          created_at?: string;
        };
        Relationships: [];
      };

      contractor_customer_health: {
        Row: {
          id: string;
          organization_id: string;
          health_score: number;
          churn_risk: "low" | "medium" | "high";
          weekly_active_days: number;
          roster_utilization_pct: number;
          renewal_reminder_sent: boolean;
          last_activity_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          health_score?: number;
          churn_risk?: "low" | "medium" | "high";
          weekly_active_days?: number;
          roster_utilization_pct?: number;
          renewal_reminder_sent?: boolean;
          last_activity_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          health_score?: number;
          churn_risk?: "low" | "medium" | "high";
          weekly_active_days?: number;
          roster_utilization_pct?: number;
          renewal_reminder_sent?: boolean;
          last_activity_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      worker_identity_exports: {
        Row: {
          id: string;
          worker_profile_id: string;
          export_format: "json" | "pdf" | "csv";
          cryptographic_hash: string;
          exported_by: string;
          exported_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          export_format?: "json" | "pdf" | "csv";
          cryptographic_hash: string;
          exported_by: string;
          exported_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          export_format?: "json" | "pdf" | "csv";
          cryptographic_hash?: string;
          exported_by?: string;
          exported_at?: string;
        };
        Relationships: [];
      };

      regional_expansion_readiness: {
        Row: {
          id: string;
          state: string;
          district: string;
          contractor_demand_score: number;
          artisan_density_score: number;
          institutional_access_score: number;
          readiness_score: number;
          status: "active_base" | "selected_expansion" | "pipeline" | "exploratory";
          local_operating_partner: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          state: string;
          district: string;
          contractor_demand_score: number;
          artisan_density_score: number;
          institutional_access_score: number;
          readiness_score: number;
          status?: "active_base" | "selected_expansion" | "pipeline" | "exploratory";
          local_operating_partner?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          state?: string;
          district?: string;
          contractor_demand_score?: number;
          artisan_density_score?: number;
          institutional_access_score?: number;
          readiness_score?: number;
          status?: "active_base" | "selected_expansion" | "pipeline" | "exploratory";
          local_operating_partner?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      operational_regions: {
        Row: {
          id: string;
          region_code: string;
          state: string;
          district: string;
          subdistrict_blocks: string[];
          primary_city: string;
          pin_codes: string[];
          supported_languages: string[];
          trade_aliases: Record<string, string[]>;
          discovery_radius_km: number;
          status: "proposed" | "research_in_progress" | "partner_validation" | "worker_demand_validation" | "operational_preparation" | "controlled_pilot" | "operational_review" | "active" | "suspended" | "closed" | "planning" | "deactivated";
          feature_flags: Record<string, boolean>;
          launch_owner_id: string | null;
          accountable_partner_name: string | null;
          active_incident_count: number;
          readiness_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          region_code: string;
          state: string;
          district: string;
          subdistrict_blocks?: string[];
          primary_city: string;
          pin_codes?: string[];
          supported_languages?: string[];
          trade_aliases?: Record<string, string[]>;
          discovery_radius_km?: number;
          status?: "proposed" | "research_in_progress" | "partner_validation" | "worker_demand_validation" | "operational_preparation" | "controlled_pilot" | "operational_review" | "active" | "suspended" | "closed" | "planning" | "deactivated";
          feature_flags?: Record<string, boolean>;
          launch_owner_id?: string | null;
          accountable_partner_name?: string | null;
          active_incident_count?: number;
          readiness_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          region_code?: string;
          state?: string;
          district?: string;
          subdistrict_blocks?: string[];
          primary_city?: string;
          pin_codes?: string[];
          supported_languages?: string[];
          trade_aliases?: Record<string, string[]>;
          discovery_radius_km?: number;
          status?: "proposed" | "research_in_progress" | "partner_validation" | "worker_demand_validation" | "operational_preparation" | "controlled_pilot" | "operational_review" | "active" | "suspended" | "closed" | "planning" | "deactivated";
          feature_flags?: Record<string, boolean>;
          launch_owner_id?: string | null;
          accountable_partner_name?: string | null;
          active_incident_count?: number;
          readiness_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      regional_administrators: {
        Row: {
          id: string;
          user_id: string;
          region_id: string;
          role: "regional_director" | "field_coordinator" | "compliance_auditor" | "support_agent";
          is_active: boolean;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          region_id: string;
          role: "regional_director" | "field_coordinator" | "compliance_auditor" | "support_agent";
          is_active?: boolean;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          region_id?: string;
          role?: "regional_director" | "field_coordinator" | "compliance_auditor" | "support_agent";
          is_active?: boolean;
          assigned_at?: string;
        };
        Relationships: [];
      };

      worker_identity_access_grants: {
        Row: {
          id: string;
          worker_profile_id: string;
          grantee_name: string;
          grantee_type: "contractor" | "institution" | "prospective_employer" | "verifier";
          access_token_hash: string;
          disclosed_sections: Record<string, boolean>;
          status: "active" | "revoked" | "expired";
          expires_at: string;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          grantee_name: string;
          grantee_type: "contractor" | "institution" | "prospective_employer" | "verifier";
          access_token_hash: string;
          disclosed_sections?: Record<string, boolean>;
          status?: "active" | "revoked" | "expired";
          expires_at: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          grantee_name?: string;
          grantee_type?: "contractor" | "institution" | "prospective_employer" | "verifier";
          access_token_hash?: string;
          disclosed_sections?: Record<string, boolean>;
          status?: "active" | "revoked" | "expired";
          expires_at?: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      identity_access_audit_logs: {
        Row: {
          id: string;
          grant_id: string | null;
          worker_profile_id: string;
          accessor_ip_hash: string | null;
          accessor_user_agent: string | null;
          action: "view" | "download" | "verify" | "revoke";
          accessed_at: string;
        };
        Insert: {
          id?: string;
          grant_id?: string | null;
          worker_profile_id: string;
          accessor_ip_hash?: string | null;
          accessor_user_agent?: string | null;
          action: "view" | "download" | "verify" | "revoke";
          accessed_at?: string;
        };
        Update: {
          id?: string;
          grant_id?: string | null;
          worker_profile_id?: string;
          accessor_ip_hash?: string | null;
          accessor_user_agent?: string | null;
          action?: "view" | "download" | "verify" | "revoke";
          accessed_at?: string;
        };
        Relationships: [];
      };

      partner_crm_records: {
        Row: {
          id: string;
          partner_name: string;
          partner_type: "contractor" | "institution" | "industry_association" | "training_ngo";
          region_id: string | null;
          stage: "lead" | "contacted" | "discovery_completed" | "proposal_sent" | "pilot_agreed" | "agreement_signed" | "active" | "renewal_due" | "renewed" | "churned";
          decision_maker_name: string;
          decision_maker_role: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          expected_contract_value: number;
          actual_invoiced_value: number;
          renewal_date: string | null;
          implementation_status: "initial_contact" | "needs_assessment" | "pilot_setup" | "fully_deployed" | "needs_attention" | "paused";
          support_tier: "standard" | "dedicated_lead" | "priority_24_7";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          partner_name: string;
          partner_type: "contractor" | "institution" | "industry_association" | "training_ngo";
          region_id?: string | null;
          stage?: "lead" | "contacted" | "discovery_completed" | "proposal_sent" | "pilot_agreed" | "agreement_signed" | "active" | "renewal_due" | "renewed" | "churned";
          decision_maker_name: string;
          decision_maker_role?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          expected_contract_value?: number;
          actual_invoiced_value?: number;
          renewal_date?: string | null;
          implementation_status?: "initial_contact" | "needs_assessment" | "pilot_setup" | "fully_deployed" | "needs_attention" | "paused";
          support_tier?: "standard" | "dedicated_lead" | "priority_24_7";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          partner_name?: string;
          partner_type?: "contractor" | "institution" | "industry_association" | "training_ngo";
          region_id?: string | null;
          stage?: "lead" | "contacted" | "discovery_completed" | "proposal_sent" | "pilot_agreed" | "agreement_signed" | "active" | "renewal_due" | "renewed" | "churned";
          decision_maker_name?: string;
          decision_maker_role?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          expected_contract_value?: number;
          actual_invoiced_value?: number;
          renewal_date?: string | null;
          implementation_status?: "initial_contact" | "needs_assessment" | "pilot_setup" | "fully_deployed" | "needs_attention" | "paused";
          support_tier?: "standard" | "dedicated_lead" | "priority_24_7";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      workforce_opportunities: {
        Row: {
          id: string;
          organization_id: string | null;
          region_id: string;
          title: string;
          trade_category: string;
          required_skills: string[];
          location_district: string;
          location_pincode: string | null;
          expected_duration_days: number;
          daily_wage_range_min: number | null;
          daily_wage_range_max: number | null;
          payment_terms: string;
          status: "open" | "matching" | "filled" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          region_id: string;
          title: string;
          trade_category: string;
          required_skills?: string[];
          location_district: string;
          location_pincode?: string | null;
          expected_duration_days?: number;
          daily_wage_range_min?: number | null;
          daily_wage_range_max?: number | null;
          payment_terms?: string;
          status?: "open" | "matching" | "filled" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          region_id?: string;
          title?: string;
          trade_category?: string;
          required_skills?: string[];
          location_district?: string;
          location_pincode?: string | null;
          expected_duration_days?: number;
          daily_wage_range_min?: number | null;
          daily_wage_range_max?: number | null;
          payment_terms?: string;
          status?: "open" | "matching" | "filled" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      worker_opportunity_applications: {
        Row: {
          id: string;
          opportunity_id: string;
          worker_profile_id: string;
          match_score: number;
          match_explanation: Json;
          status: "matched" | "viewed" | "applied" | "shortlisted" | "accepted" | "declined" | "withdrawn";
          worker_consent_given: boolean;
          applied_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          worker_profile_id: string;
          match_score: number;
          match_explanation?: Json;
          status?: "matched" | "viewed" | "applied" | "shortlisted" | "accepted" | "declined" | "withdrawn";
          worker_consent_given?: boolean;
          applied_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          worker_profile_id?: string;
          match_score?: number;
          match_explanation?: Json;
          status?: "matched" | "viewed" | "applied" | "shortlisted" | "accepted" | "declined" | "withdrawn";
          worker_consent_given?: boolean;
          applied_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      skills_gap_recommendations: {
        Row: {
          id: string;
          worker_profile_id: string;
          target_trade: string;
          missing_skill: string;
          evidence_rationale: string;
          learning_resource_title: string;
          learning_resource_url: string;
          institution_provider: string;
          is_ai_generated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          target_trade: string;
          missing_skill: string;
          evidence_rationale: string;
          learning_resource_title: string;
          learning_resource_url: string;
          institution_provider: string;
          is_ai_generated?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          target_trade?: string;
          missing_skill?: string;
          evidence_rationale?: string;
          learning_resource_title?: string;
          learning_resource_url?: string;
          institution_provider?: string;
          is_ai_generated?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      institutional_credentials: {
        Row: {
          id: string;
          institution_id: string;
          cohort_id: string;
          participant_id: string;
          worker_profile_id: string;
          credential_identifier: string;
          trade_title: string;
          nsqf_level: number;
          assessment_reference: string;
          authorized_issuer_name: string;
          authorized_issuer_role: string;
          learner_consent_obtained: boolean;
          status: "issued" | "active" | "verified" | "suspended" | "revoked" | "expired";
          issued_at: string;
          verified_at: string | null;
          revoked_at: string | null;
          revocation_reason: string | null;
          schema_version: string;
          integrity_signature: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          cohort_id: string;
          participant_id: string;
          worker_profile_id: string;
          credential_identifier: string;
          trade_title: string;
          nsqf_level?: number;
          assessment_reference: string;
          authorized_issuer_name: string;
          authorized_issuer_role: string;
          learner_consent_obtained?: boolean;
          status?: "issued" | "active" | "verified" | "suspended" | "revoked" | "expired";
          issued_at?: string;
          verified_at?: string | null;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          schema_version?: string;
          integrity_signature: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          cohort_id?: string;
          participant_id?: string;
          worker_profile_id?: string;
          credential_identifier?: string;
          trade_title?: string;
          nsqf_level?: number;
          assessment_reference?: string;
          authorized_issuer_name?: string;
          authorized_issuer_role?: string;
          learner_consent_obtained?: boolean;
          status?: "issued" | "active" | "verified" | "suspended" | "revoked" | "expired";
          issued_at?: string;
          verified_at?: string | null;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          schema_version?: string;
          integrity_signature?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      institutional_partner_api_keys: {
        Row: {
          id: string;
          institution_id: string;
          key_name: string;
          key_prefix: string;
          api_key_hash: string;
          is_sandbox: boolean;
          rate_limit_per_minute: number;
          status: "active" | "suspended" | "revoked";
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          key_name: string;
          key_prefix: string;
          api_key_hash: string;
          is_sandbox?: boolean;
          rate_limit_per_minute?: number;
          status?: "active" | "suspended" | "revoked";
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          key_name?: string;
          key_prefix?: string;
          api_key_hash?: string;
          is_sandbox?: boolean;
          rate_limit_per_minute?: number;
          status?: "active" | "suspended" | "revoked";
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      worker_disputes: {
        Row: {
          id: string;
          worker_profile_id: string;
          dispute_type: "unpaid_wages" | "incorrect_work_record" | "false_review" | "unauthorized_sharing" | "credential_discrepancy" | "contractor_harassment" | "account_recovery";
          target_id: string | null;
          counterparty_name: string;
          evidence_notes: string;
          claimed_amount: number | null;
          status: "submitted" | "under_review" | "in_mediation" | "resolved_worker_upheld" | "resolved_counterparty_upheld" | "dismissed" | "appealed";
          resolution_summary: string | null;
          assigned_reviewer_id: string | null;
          resolved_at: string | null;
          sla_due_at: string | null;
          is_retaliatory_suspected: boolean;
          confidential_evidence_urls: string[];
          appeal_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          dispute_type: "unpaid_wages" | "incorrect_work_record" | "false_review" | "unauthorized_sharing" | "credential_discrepancy" | "contractor_harassment" | "account_recovery";
          target_id?: string | null;
          counterparty_name: string;
          evidence_notes: string;
          claimed_amount?: number | null;
          status?: "submitted" | "under_review" | "in_mediation" | "resolved_worker_upheld" | "resolved_counterparty_upheld" | "dismissed" | "appealed";
          resolution_summary?: string | null;
          assigned_reviewer_id?: string | null;
          resolved_at?: string | null;
          sla_due_at?: string | null;
          is_retaliatory_suspected?: boolean;
          confidential_evidence_urls?: string[];
          appeal_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          dispute_type?: "unpaid_wages" | "incorrect_work_record" | "false_review" | "unauthorized_sharing" | "credential_discrepancy" | "contractor_harassment" | "account_recovery";
          target_id?: string | null;
          counterparty_name?: string;
          evidence_notes?: string;
          claimed_amount?: number | null;
          status?: "submitted" | "under_review" | "in_mediation" | "resolved_worker_upheld" | "resolved_counterparty_upheld" | "dismissed" | "appealed";
          resolution_summary?: string | null;
          assigned_reviewer_id?: string | null;
          resolved_at?: string | null;
          sla_due_at?: string | null;
          is_retaliatory_suspected?: boolean;
          confidential_evidence_urls?: string[];
          appeal_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      opportunity_feedback_reports: {
        Row: {
          id: string;
          opportunity_id: string;
          reporter_profile_id: string;
          report_type: "misleading_terms" | "unpaid_wages" | "unsafe_conditions" | "fake_opportunity" | "discriminatory_treatment";
          details: string;
          status: "submitted" | "investigating" | "action_taken" | "dismissed";
          action_taken: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          reporter_profile_id: string;
          report_type: "misleading_terms" | "unpaid_wages" | "unsafe_conditions" | "fake_opportunity" | "discriminatory_treatment";
          details: string;
          status?: "submitted" | "investigating" | "action_taken" | "dismissed";
          action_taken?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          reporter_profile_id?: string;
          report_type?: "misleading_terms" | "unpaid_wages" | "unsafe_conditions" | "fake_opportunity" | "discriminatory_treatment";
          details?: string;
          status?: "submitted" | "investigating" | "action_taken" | "dismissed";
          action_taken?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      regional_launch_transitions: {
        Row: {
          id: string;
          region_id: string;
          from_status: string;
          to_status: string;
          authorized_by: string | null;
          authorization_notes: string;
          readiness_score: number | null;
          evidence_checklist: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          from_status: string;
          to_status: string;
          authorized_by?: string | null;
          authorization_notes: string;
          readiness_score?: number | null;
          evidence_checklist?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          region_id?: string;
          from_status?: string;
          to_status?: string;
          authorized_by?: string | null;
          authorization_notes?: string;
          readiness_score?: number | null;
          evidence_checklist?: Json;
          created_at?: string;
        };
        Relationships: [];
      };

      cross_region_project_staffing: {
        Row: {
          id: string;
          organization_id: string;
          opportunity_id: string | null;
          source_region_id: string;
          target_region_id: string;
          worker_profile_id: string;
          trade_required: string;
          crew_role: string;
          duration_days: number;
          daily_wage: number;
          travel_stipend: number;
          accommodation_provided: boolean;
          worker_consent_obtained: boolean;
          status: "proposed" | "offered" | "accepted" | "deployed" | "completed" | "declined" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          opportunity_id?: string | null;
          source_region_id: string;
          target_region_id: string;
          worker_profile_id: string;
          trade_required: string;
          crew_role?: string;
          duration_days?: number;
          daily_wage: number;
          travel_stipend?: number;
          accommodation_provided?: boolean;
          worker_consent_obtained?: boolean;
          status?: "proposed" | "offered" | "accepted" | "deployed" | "completed" | "declined" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          opportunity_id?: string | null;
          source_region_id?: string;
          target_region_id?: string;
          worker_profile_id?: string;
          trade_required?: string;
          crew_role?: string;
          duration_days?: number;
          daily_wage?: number;
          travel_stipend?: number;
          accommodation_provided?: boolean;
          worker_consent_obtained?: boolean;
          status?: "proposed" | "offered" | "accepted" | "deployed" | "completed" | "declined" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      payment_records_ledger: {
        Row: {
          id: string;
          booking_id: string | null;
          opportunity_id: string | null;
          worker_profile_id: string;
          employer_declared_amount: number;
          worker_agreed_amount: number;
          amount_invoiced: number;
          amount_paid: number;
          platform_commission_amount: number;
          payment_date: string | null;
          payment_evidence_ref: string | null;
          disputed_amount: number | null;
          resolution_status: "pending" | "settled" | "disputed" | "escalated";
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          opportunity_id?: string | null;
          worker_profile_id: string;
          employer_declared_amount: number;
          worker_agreed_amount: number;
          amount_invoiced: number;
          amount_paid?: number;
          platform_commission_amount?: number;
          payment_date?: string | null;
          payment_evidence_ref?: string | null;
          disputed_amount?: number | null;
          resolution_status?: "pending" | "settled" | "disputed" | "escalated";
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          opportunity_id?: string | null;
          worker_profile_id?: string;
          employer_declared_amount?: number;
          worker_agreed_amount?: number;
          amount_invoiced?: number;
          amount_paid?: number;
          platform_commission_amount?: number;
          payment_date?: string | null;
          payment_evidence_ref?: string | null;
          disputed_amount?: number | null;
          resolution_status?: "pending" | "settled" | "disputed" | "escalated";
          created_at?: string;
        };
        Relationships: [];
      };

      offline_verification_logs: {
        Row: {
          id: string;
          worker_profile_id: string;
          verifier_identity: string;
          cached_key_version: string;
          last_sync_timestamp: string;
          scan_timestamp: string;
          verification_result: "valid_signature_cached" | "signature_mismatch" | "expired_cache" | "revoked_online_check";
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          verifier_identity: string;
          cached_key_version?: string;
          last_sync_timestamp: string;
          scan_timestamp?: string;
          verification_result: "valid_signature_cached" | "signature_mismatch" | "expired_cache" | "revoked_online_check";
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          verifier_identity?: string;
          cached_key_version?: string;
          last_sync_timestamp?: string;
          scan_timestamp?: string;
          verification_result?: "valid_signature_cached" | "signature_mismatch" | "expired_cache" | "revoked_online_check";
          created_at?: string;
        };
        Relationships: [];
      };

      regional_launch_milestones: {
        Row: {
          id: string;
          region_id: string;
          stage: string;
          milestone_name: string;
          status: "pending" | "in_progress" | "completed" | "blocked" | "skipped";
          accountable_owner_id: string | null;
          target_date: string | null;
          completed_at: string | null;
          evidence_notes: string | null;
          risk_assessment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          stage: string;
          milestone_name: string;
          status?: "pending" | "in_progress" | "completed" | "blocked" | "skipped";
          accountable_owner_id?: string | null;
          target_date?: string | null;
          completed_at?: string | null;
          evidence_notes?: string | null;
          risk_assessment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          region_id?: string;
          stage?: string;
          milestone_name?: string;
          status?: "pending" | "in_progress" | "completed" | "blocked" | "skipped";
          accountable_owner_id?: string | null;
          target_date?: string | null;
          completed_at?: string | null;
          evidence_notes?: string | null;
          risk_assessment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      regional_operational_incidents: {
        Row: {
          id: string;
          region_id: string;
          title: string;
          incident_type: "wage_theft" | "labor_violence" | "safety_violation" | "system_outage" | "credential_fraud" | "data_breach" | "regulatory_action";
          severity: "low" | "medium" | "high" | "critical";
          status: "open" | "investigating" | "mitigated" | "resolved" | "closed";
          details: string;
          reported_by: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          resolution_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          title: string;
          incident_type: "wage_theft" | "labor_violence" | "safety_violation" | "system_outage" | "credential_fraud" | "data_breach" | "regulatory_action";
          severity?: "low" | "medium" | "high" | "critical";
          status?: "open" | "investigating" | "mitigated" | "resolved" | "closed";
          details: string;
          reported_by?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          resolution_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          region_id?: string;
          title?: string;
          incident_type?: "wage_theft" | "labor_violence" | "safety_violation" | "system_outage" | "credential_fraud" | "data_breach" | "regulatory_action";
          severity?: "low" | "medium" | "high" | "critical";
          status?: "open" | "investigating" | "mitigated" | "resolved" | "closed";
          details?: string;
          reported_by?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          resolution_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      institution_authorized_signatories: {
        Row: {
          id: string;
          institution_id: string;
          full_name: string;
          designation: string;
          signatory_key_fingerprint: string;
          is_active: boolean;
          authorized_from: string;
          authorized_until: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          full_name: string;
          designation: string;
          signatory_key_fingerprint: string;
          is_active?: boolean;
          authorized_from?: string;
          authorized_until?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          full_name?: string;
          designation?: string;
          signatory_key_fingerprint?: string;
          is_active?: boolean;
          authorized_from?: string;
          authorized_until?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      worker_privacy_settings: {
        Row: {
          id: string;
          worker_profile_id: string;
          field_visibility: Record<string, boolean>;
          consent_expires_at: string | null;
          auto_renew_consent: boolean;
          allow_cross_region_discovery: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          field_visibility?: Record<string, boolean>;
          consent_expires_at?: string | null;
          auto_renew_consent?: boolean;
          allow_cross_region_discovery?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          field_visibility?: Record<string, boolean>;
          consent_expires_at?: string | null;
          auto_renew_consent?: boolean;
          allow_cross_region_discovery?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      financial_gst_ledger: {
        Row: {
          id: string;
          invoice_number: string;
          organization_id: string;
          region_id: string | null;
          taxable_amount: number;
          gst_rate: number;
          cgst_amount: number;
          sgst_amount: number;
          igst_amount: number;
          total_tax_amount: number;
          grand_total: number;
          state_code: string;
          is_interstate: boolean;
          payment_date: string;
          reconciliation_status: "pending" | "reconciled" | "refunded" | "disputed";
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          organization_id: string;
          region_id?: string | null;
          taxable_amount: number;
          gst_rate?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_tax_amount: number;
          grand_total: number;
          state_code: string;
          is_interstate?: boolean;
          payment_date?: string;
          reconciliation_status?: "pending" | "reconciled" | "refunded" | "disputed";
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          organization_id?: string;
          region_id?: string | null;
          taxable_amount?: number;
          gst_rate?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          igst_amount?: number;
          total_tax_amount?: number;
          grand_total?: number;
          state_code?: string;
          is_interstate?: boolean;
          payment_date?: string;
          reconciliation_status?: "pending" | "reconciled" | "refunded" | "disputed";
          created_at?: string;
        };
        Relationships: [];
      };

      regional_service_telemetry: {
        Row: {
          id: string;
          region_id: string;
          metric_name: string;
          metric_value: number;
          dimension_tags: Json;
          is_simulated: boolean;
          measured_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          metric_name: string;
          metric_value: number;
          dimension_tags?: Json;
          is_simulated?: boolean;
          measured_at?: string;
        };
        Update: {
          id?: string;
          region_id?: string;
          metric_name?: string;
          metric_value?: number;
          dimension_tags?: Json;
          is_simulated?: boolean;
          measured_at?: string;
        };
        Relationships: [];
      };

      regional_dual_approvals: {
        Row: {
          id: string;
          region_id: string;
          target_status: string;
          primary_approver_id: string;
          primary_approved_at: string;
          secondary_approver_id: string | null;
          secondary_approved_at: string | null;
          readiness_score: number;
          mandatory_gates_passed: boolean;
          evidence_references: Json;
          decision_reason: string;
          policy_version: string;
          approval_status: "pending_secondary" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          target_status: string;
          primary_approver_id: string;
          primary_approved_at?: string;
          secondary_approver_id?: string | null;
          secondary_approved_at?: string | null;
          readiness_score: number;
          mandatory_gates_passed?: boolean;
          evidence_references?: Json;
          decision_reason: string;
          policy_version?: string;
          approval_status?: "pending_secondary" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          id?: string;
          region_id?: string;
          target_status?: string;
          primary_approver_id?: string;
          primary_approved_at?: string;
          secondary_approver_id?: string | null;
          secondary_approved_at?: string | null;
          readiness_score?: number;
          mandatory_gates_passed?: boolean;
          evidence_references?: Json;
          decision_reason?: string;
          policy_version?: string;
          approval_status?: "pending_secondary" | "approved" | "rejected";
          created_at?: string;
        };
        Relationships: [];
      };

      review_moderation_appeals: {
        Row: {
          id: string;
          review_id: string;
          worker_profile_id: string;
          contractor_organization_id: string | null;
          dispute_id: string | null;
          original_rating: number;
          quarantine_reason: string;
          submitted_evidence: Json;
          moderator_id: string | null;
          moderation_status: "quarantined" | "restored_valid" | "suppressed_retaliatory" | "under_appeal" | "dismissed";
          appeal_reason: string | null;
          appeal_resolution_notes: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          worker_profile_id: string;
          contractor_organization_id?: string | null;
          dispute_id?: string | null;
          original_rating: number;
          quarantine_reason: string;
          submitted_evidence?: Json;
          moderator_id?: string | null;
          moderation_status?: "quarantined" | "restored_valid" | "suppressed_retaliatory" | "under_appeal" | "dismissed";
          appeal_reason?: string | null;
          appeal_resolution_notes?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          worker_profile_id?: string;
          contractor_organization_id?: string | null;
          dispute_id?: string | null;
          original_rating?: number;
          quarantine_reason?: string;
          submitted_evidence?: Json;
          moderator_id?: string | null;
          moderation_status?: "quarantined" | "restored_valid" | "suppressed_retaliatory" | "under_appeal" | "dismissed";
          appeal_reason?: string | null;
          appeal_resolution_notes?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      operational_incidents_lifecycle: {
        Row: {
          id: string;
          incident_id: string;
          current_stage: "detected" | "triaged" | "contained" | "investigated" | "remediated" | "recovered" | "reviewed";
          accountable_owner_id: string;
          containment_steps: string | null;
          affected_entities: Json;
          notification_required: boolean;
          notification_dispatched_at: string | null;
          post_incident_review_notes: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          incident_id: string;
          current_stage?: "detected" | "triaged" | "contained" | "investigated" | "remediated" | "recovered" | "reviewed";
          accountable_owner_id: string;
          containment_steps?: string | null;
          affected_entities?: Json;
          notification_required?: boolean;
          notification_dispatched_at?: string | null;
          post_incident_review_notes?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          incident_id?: string;
          current_stage?: "detected" | "triaged" | "contained" | "investigated" | "remediated" | "recovered" | "reviewed";
          accountable_owner_id?: string;
          containment_steps?: string | null;
          affected_entities?: Json;
          notification_required?: boolean;
          notification_dispatched_at?: string | null;
          post_incident_review_notes?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      financial_reconciliation_exceptions: {
        Row: {
          id: string;
          ledger_entry_id: string | null;
          invoice_number: string | null;
          exception_type: "refund" | "chargeback" | "duplicate_webhook_attempt" | "disputed_tax" | "unreconciled_gateway_difference" | "gateway_fee_mismatch";
          amount: number;
          currency: string;
          status: "open" | "investigating" | "resolved_credited" | "resolved_adjusted" | "written_off";
          resolution_notes: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ledger_entry_id?: string | null;
          invoice_number?: string | null;
          exception_type: "refund" | "chargeback" | "duplicate_webhook_attempt" | "disputed_tax" | "unreconciled_gateway_difference" | "gateway_fee_mismatch";
          amount?: number;
          currency?: string;
          status?: "open" | "investigating" | "resolved_credited" | "resolved_adjusted" | "written_off";
          resolution_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ledger_entry_id?: string | null;
          invoice_number?: string | null;
          exception_type?: "refund" | "chargeback" | "duplicate_webhook_attempt" | "disputed_tax" | "unreconciled_gateway_difference" | "gateway_fee_mismatch";
          amount?: number;
          currency?: string;
          status?: "open" | "investigating" | "resolved_credited" | "resolved_adjusted" | "written_off";
          resolution_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      regional_operational_scorecards: {
        Row: {
          id: string;
          region_id: string;
          evaluation_period_start: string;
          evaluation_period_end: string;
          active_worker_count: number;
          registered_worker_count: number;
          verified_contractor_count: number;
          gross_collections: number;
          net_saas_mrr: number;
          direct_field_costs: number;
          direct_hosting_ai_costs: number;
          contribution_margin: number;
          margin_percentage: number;
          operational_rating: "highly_profitable" | "sustainable" | "break_even" | "subsidized_expansion" | "critical_intervention";
          created_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          evaluation_period_start: string;
          evaluation_period_end: string;
          active_worker_count?: number;
          registered_worker_count?: number;
          verified_contractor_count?: number;
          gross_collections?: number;
          net_saas_mrr?: number;
          direct_field_costs?: number;
          direct_hosting_ai_costs?: number;
          contribution_margin?: number;
          margin_percentage?: number;
          operational_rating?: "highly_profitable" | "sustainable" | "break_even" | "subsidized_expansion" | "critical_intervention";
          created_at?: string;
        };
        Update: {
          id?: string;
          region_id?: string;
          evaluation_period_start?: string;
          evaluation_period_end?: string;
          active_worker_count?: number;
          registered_worker_count?: number;
          verified_contractor_count?: number;
          gross_collections?: number;
          net_saas_mrr?: number;
          direct_field_costs?: number;
          direct_hosting_ai_costs?: number;
          contribution_margin?: number;
          margin_percentage?: number;
          operational_rating?: "highly_profitable" | "sustainable" | "break_even" | "subsidized_expansion" | "critical_intervention";
          created_at?: string;
        };
        Relationships: [];
      };

      worker_consent_audit_events: {
        Row: {
          id: string;
          worker_profile_id: string;
          recipient_entity_type: "contractor" | "institution" | "verifier" | "public" | "system";
          recipient_entity_id: string | null;
          action: "granted" | "renewed" | "expired" | "revoked" | "modified";
          disclosed_fields: string[];
          policy_version: string;
          actor_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          recipient_entity_type: "contractor" | "institution" | "verifier" | "public" | "system";
          recipient_entity_id?: string | null;
          action: "granted" | "renewed" | "expired" | "revoked" | "modified";
          disclosed_fields?: string[];
          policy_version?: string;
          actor_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          recipient_entity_type?: "contractor" | "institution" | "verifier" | "public" | "system";
          recipient_entity_id?: string | null;
          action?: "granted" | "renewed" | "expired" | "revoked" | "modified";
          disclosed_fields?: string[];
          policy_version?: string;
          actor_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      regional_network_liquidity_snapshots: {
        Row: {
          id: string;
          region_code: string;
          snapshot_date: string;
          reporting_window: "7d" | "30d" | "90d";
          registered_workers: number;
          confirmed_workers: number;
          credential_verified_workers: number;
          recently_active_workers: number;
          available_workers: number;
          interstate_mobility_workers: number;
          job_completing_workers: number;
          active_contractors: number;
          active_customers: number;
          projects_published: number;
          qualified_matches: number;
          accepted_opportunities: number;
          confirmed_bookings: number;
          completed_jobs: number;
          avg_time_to_first_match_ms: number;
          avg_time_to_first_booking_ms: number;
          booking_completion_rate: number;
          repeat_booking_rate: number;
          opportunity_fulfilment_rate: number;
          liquidity_status: "dormant" | "emerging" | "liquid" | "undersupplied" | "underdemanded";
          action_recommendation: "continue_controlled_operations" | "increase_worker_acquisition" | "increase_customer_acquisition" | "improve_trade_coverage" | "improve_field_support" | "pause_expansion" | "enter_operational_review";
          is_simulated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          region_code: string;
          snapshot_date: string;
          reporting_window?: "7d" | "30d" | "90d";
          registered_workers?: number;
          confirmed_workers?: number;
          credential_verified_workers?: number;
          recently_active_workers?: number;
          available_workers?: number;
          interstate_mobility_workers?: number;
          job_completing_workers?: number;
          active_contractors?: number;
          active_customers?: number;
          projects_published?: number;
          qualified_matches?: number;
          accepted_opportunities?: number;
          confirmed_bookings?: number;
          completed_jobs?: number;
          avg_time_to_first_match_ms?: number;
          avg_time_to_first_booking_ms?: number;
          booking_completion_rate?: number;
          repeat_booking_rate?: number;
          opportunity_fulfilment_rate?: number;
          liquidity_status?: "dormant" | "emerging" | "liquid" | "undersupplied" | "underdemanded";
          action_recommendation: "continue_controlled_operations" | "increase_worker_acquisition" | "increase_customer_acquisition" | "improve_trade_coverage" | "improve_field_support" | "pause_expansion" | "enter_operational_review";
          is_simulated?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          region_code?: string;
          snapshot_date?: string;
          reporting_window?: "7d" | "30d" | "90d";
          registered_workers?: number;
          confirmed_workers?: number;
          credential_verified_workers?: number;
          recently_active_workers?: number;
          available_workers?: number;
          interstate_mobility_workers?: number;
          job_completing_workers?: number;
          active_contractors?: number;
          active_customers?: number;
          projects_published?: number;
          qualified_matches?: number;
          accepted_opportunities?: number;
          confirmed_bookings?: number;
          completed_jobs?: number;
          avg_time_to_first_match_ms?: number;
          avg_time_to_first_booking_ms?: number;
          booking_completion_rate?: number;
          repeat_booking_rate?: number;
          opportunity_fulfilment_rate?: number;
          liquidity_status?: "dormant" | "emerging" | "liquid" | "undersupplied" | "underdemanded";
          action_recommendation?: "continue_controlled_operations" | "increase_worker_acquisition" | "increase_customer_acquisition" | "improve_trade_coverage" | "improve_field_support" | "pause_expansion" | "enter_operational_review";
          is_simulated?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      worker_payout_confirmations: {
        Row: {
          id: string;
          payment_record_id: string | null;
          worker_profile_id: string;
          booking_id: string | null;
          contractor_organization_id: string | null;
          contractor_declared_amount: number;
          worker_agreed_amount: number;
          actual_payout_amount: number;
          payout_method: "bank_transfer" | "upi" | "cash_voucher_verified";
          payout_reference: string | null;
          payout_date: string;
          worker_confirmation_status: "pending" | "confirmed_received" | "disputed_amount" | "disputed_unpaid";
          worker_confirmed_at: string | null;
          worker_disputed_amount: number;
          worker_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_record_id?: string | null;
          worker_profile_id: string;
          booking_id?: string | null;
          contractor_organization_id?: string | null;
          contractor_declared_amount: number;
          worker_agreed_amount: number;
          actual_payout_amount: number;
          payout_method: "bank_transfer" | "upi" | "cash_voucher_verified";
          payout_reference?: string | null;
          payout_date?: string;
          worker_confirmation_status?: "pending" | "confirmed_received" | "disputed_amount" | "disputed_unpaid";
          worker_confirmed_at?: string | null;
          worker_disputed_amount?: number;
          worker_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_record_id?: string | null;
          worker_profile_id?: string;
          booking_id?: string | null;
          contractor_organization_id?: string | null;
          contractor_declared_amount?: number;
          worker_agreed_amount?: number;
          actual_payout_amount?: number;
          payout_method?: "bank_transfer" | "upi" | "cash_voucher_verified";
          payout_reference?: string | null;
          payout_date?: string;
          worker_confirmation_status?: "pending" | "confirmed_received" | "disputed_amount" | "disputed_unpaid";
          worker_confirmed_at?: string | null;
          worker_disputed_amount?: number;
          worker_notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      contractor_customer_success_events: {
        Row: {
          id: string;
          organization_id: string;
          event_type: "trial_started" | "trial_converted" | "plan_renewed" | "plan_upgraded" | "plan_downgraded" | "churn_warning" | "cancellation_requested" | "support_ticket_resolved";
          previous_tier: string | null;
          new_tier: string | null;
          health_score: number;
          roster_utilization_percent: number;
          active_projects_count: number;
          churn_risk_level: "low" | "medium" | "high" | "critical";
          cancellation_reason: string | null;
          support_resolution_ms: number | null;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          event_type: "trial_started" | "trial_converted" | "plan_renewed" | "plan_upgraded" | "plan_downgraded" | "churn_warning" | "cancellation_requested" | "support_ticket_resolved";
          previous_tier?: string | null;
          new_tier?: string | null;
          health_score?: number;
          roster_utilization_percent?: number;
          active_projects_count?: number;
          churn_risk_level?: "low" | "medium" | "high" | "critical";
          cancellation_reason?: string | null;
          support_resolution_ms?: number | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          event_type?: "trial_started" | "trial_converted" | "plan_renewed" | "plan_upgraded" | "plan_downgraded" | "churn_warning" | "cancellation_requested" | "support_ticket_resolved";
          previous_tier?: string | null;
          new_tier?: string | null;
          health_score?: number;
          roster_utilization_percent?: number;
          active_projects_count?: number;
          churn_risk_level?: "low" | "medium" | "high" | "critical";
          cancellation_reason?: string | null;
          support_resolution_ms?: number | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Relationships: [];
      };

      institutional_onboarding_lifecycle: {
        Row: {
          id: string;
          institution_id: string;
          stage: "initial_application" | "organization_verified" | "signatory_validated" | "integration_review" | "sandbox_testing" | "security_approved" | "production_active" | "periodic_reverification";
          stage_status: "in_progress" | "completed" | "blocked" | "failed";
          completed_stages: string[];
          mou_reference: string | null;
          mou_signed_at: string | null;
          technical_integration_verified: boolean;
          sandbox_test_passed: boolean;
          security_signoff_by: string | null;
          authorized_signatory_name: string | null;
          authorized_signatory_designation: string | null;
          blockers: string[];
          last_reverified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          stage?: "initial_application" | "organization_verified" | "signatory_validated" | "integration_review" | "sandbox_testing" | "security_approved" | "production_active" | "periodic_reverification";
          stage_status?: "in_progress" | "completed" | "blocked" | "failed";
          completed_stages?: string[];
          mou_reference?: string | null;
          mou_signed_at?: string | null;
          technical_integration_verified?: boolean;
          sandbox_test_passed?: boolean;
          security_signoff_by?: string | null;
          authorized_signatory_name?: string | null;
          authorized_signatory_designation?: string | null;
          blockers?: string[];
          last_reverified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          stage?: "initial_application" | "organization_verified" | "signatory_validated" | "integration_review" | "sandbox_testing" | "security_approved" | "production_active" | "periodic_reverification";
          stage_status?: "in_progress" | "completed" | "blocked" | "failed";
          completed_stages?: string[];
          mou_reference?: string | null;
          mou_signed_at?: string | null;
          technical_integration_verified?: boolean;
          sandbox_test_passed?: boolean;
          security_signoff_by?: string | null;
          authorized_signatory_name?: string | null;
          authorized_signatory_designation?: string | null;
          blockers?: string[];
          last_reverified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      worker_support_assignments: {
        Row: {
          id: string;
          worker_profile_id: string;
          support_category: "immediate_safety_risk" | "wage_dispute" | "identity_theft" | "fraud" | "retaliation" | "discrimination" | "service_complaint";
          priority: "tier_1_critical" | "tier_2_urgent" | "tier_3_standard";
          assigned_coordinator_id: string | null;
          region_code: string;
          status: "submitted" | "acknowledged" | "action_taken" | "resolved" | "escalated" | "reopened";
          intake_notes: string | null;
          action_summary: string | null;
          resolution_notes: string | null;
          acknowledged_at: string | null;
          first_action_at: string | null;
          resolved_at: string | null;
          worker_satisfaction_score: number | null;
          is_whistleblower: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          support_category: "immediate_safety_risk" | "wage_dispute" | "identity_theft" | "fraud" | "retaliation" | "discrimination" | "service_complaint";
          priority?: "tier_1_critical" | "tier_2_urgent" | "tier_3_standard";
          assigned_coordinator_id?: string | null;
          region_code: string;
          status?: "submitted" | "acknowledged" | "action_taken" | "resolved" | "escalated" | "reopened";
          intake_notes?: string | null;
          action_summary?: string | null;
          resolution_notes?: string | null;
          acknowledged_at?: string | null;
          first_action_at?: string | null;
          resolved_at?: string | null;
          worker_satisfaction_score?: number | null;
          is_whistleblower?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          support_category?: "immediate_safety_risk" | "wage_dispute" | "identity_theft" | "fraud" | "retaliation" | "discrimination" | "service_complaint";
          priority?: "tier_1_critical" | "tier_2_urgent" | "tier_3_standard";
          assigned_coordinator_id?: string | null;
          region_code?: string;
          status?: "submitted" | "acknowledged" | "action_taken" | "resolved" | "escalated" | "reopened";
          intake_notes?: string | null;
          action_summary?: string | null;
          resolution_notes?: string | null;
          acknowledged_at?: string | null;
          first_action_at?: string | null;
          resolved_at?: string | null;
          worker_satisfaction_score?: number | null;
          is_whistleblower?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      analytics_provenance_events: {
        Row: {
          id: string;
          event_name: string;
          entity_type: "worker" | "contractor" | "institution" | "booking" | "match" | "opportunity";
          entity_id: string;
          region_code: string;
          is_simulated: boolean;
          model_version: string | null;
          prompt_version: string | null;
          extraction_confidence: number | null;
          worker_confirmed: boolean | null;
          worker_corrected: boolean | null;
          payload_hash: string;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          entity_type: "worker" | "contractor" | "institution" | "booking" | "match" | "opportunity";
          entity_id: string;
          region_code: string;
          is_simulated?: boolean;
          model_version?: string | null;
          prompt_version?: string | null;
          extraction_confidence?: number | null;
          worker_confirmed?: boolean | null;
          worker_corrected?: boolean | null;
          payload_hash: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_name?: string;
          entity_type?: "worker" | "contractor" | "institution" | "booking" | "match" | "opportunity";
          entity_id?: string;
          region_code?: string;
          is_simulated?: boolean;
          model_version?: string | null;
          prompt_version?: string | null;
          extraction_confidence?: number | null;
          worker_confirmed?: boolean | null;
          worker_corrected?: boolean | null;
          payload_hash?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Relationships: [];
      };
      metric_evidence_records: {
        Row: {
          id: string;
          metric_identifier: string;
          reporting_period: string;
          data_source: string;
          calculation_method: string;
          verification_status: "verified" | "partially_verified" | "self_reported" | "estimated" | "unavailable" | "disputed";
          metric_value: Record<string, any>;
          raw_evidence_hash: string;
          verified_by: string | null;
          verification_notes: string | null;
          last_updated_at: string;
          is_simulated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          metric_identifier: string;
          reporting_period: string;
          data_source: string;
          calculation_method: string;
          verification_status: "verified" | "partially_verified" | "self_reported" | "estimated" | "unavailable" | "disputed";
          metric_value: Record<string, any>;
          raw_evidence_hash: string;
          verified_by?: string | null;
          verification_notes?: string | null;
          last_updated_at?: string;
          is_simulated?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          metric_identifier?: string;
          reporting_period?: string;
          data_source?: string;
          calculation_method?: string;
          verification_status?: "verified" | "partially_verified" | "self_reported" | "estimated" | "unavailable" | "disputed";
          metric_value?: Record<string, any>;
          raw_evidence_hash?: string;
          verified_by?: string | null;
          verification_notes?: string | null;
          last_updated_at?: string;
          is_simulated?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      worker_outcome_cohorts: {
        Row: {
          id: string;
          worker_profile_id: string;
          cohort_id: string;
          baseline_period_start: string;
          baseline_period_end: string;
          follow_up_period_start: string;
          follow_up_period_end: string;
          worker_reported_monthly_income: number | null;
          customer_confirmed_monthly_income: number | null;
          payment_record_backed_monthly_income: number | null;
          independently_reconciled_monthly_income: number | null;
          outcome_tracking_opted_in: boolean;
          completion_count: number;
          repeat_customer_count: number;
          avg_enquiry_to_booking_hours: number | null;
          avg_booking_to_completion_hours: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_profile_id: string;
          cohort_id: string;
          baseline_period_start: string;
          baseline_period_end: string;
          follow_up_period_start: string;
          follow_up_period_end: string;
          worker_reported_monthly_income?: number | null;
          customer_confirmed_monthly_income?: number | null;
          payment_record_backed_monthly_income?: number | null;
          independently_reconciled_monthly_income?: number | null;
          outcome_tracking_opted_in?: boolean;
          completion_count?: number;
          repeat_customer_count?: number;
          avg_enquiry_to_booking_hours?: number | null;
          avg_booking_to_completion_hours?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_profile_id?: string;
          cohort_id?: string;
          baseline_period_start?: string;
          baseline_period_end?: string;
          follow_up_period_start?: string;
          follow_up_period_end?: string;
          worker_reported_monthly_income?: number | null;
          customer_confirmed_monthly_income?: number | null;
          payment_record_backed_monthly_income?: number | null;
          independently_reconciled_monthly_income?: number | null;
          outcome_tracking_opted_in?: boolean;
          completion_count?: number;
          repeat_customer_count?: number;
          avg_enquiry_to_booking_hours?: number | null;
          avg_booking_to_completion_hours?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      state_launch_gate_evaluations: {
        Row: {
          id: string;
          region_code: string;
          gate_number: number;
          gate_name: string;
          evaluation_status: "passed" | "failed" | "under_review" | "exempt";
          evidence_document_uri: string | null;
          evaluated_by: string | null;
          evaluated_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          region_code: string;
          gate_number: number;
          gate_name: string;
          evaluation_status: "passed" | "failed" | "under_review" | "exempt";
          evidence_document_uri?: string | null;
          evaluated_by?: string | null;
          evaluated_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          region_code?: string;
          gate_number?: number;
          gate_name?: string;
          evaluation_status?: "passed" | "failed" | "under_review" | "exempt";
          evidence_document_uri?: string | null;
          evaluated_by?: string | null;
          evaluated_at?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      external_ecosystem_transactions: {
        Row: {
          id: string;
          protocol_type: "ondc" | "onest" | "beckn_generic";
          action: "search" | "on_search" | "select" | "on_select" | "init" | "on_init" | "confirm" | "on_confirm" | "status" | "on_status" | "track" | "on_track" | "cancel" | "on_cancel" | "update" | "on_update";
          transaction_id: string;
          message_id: string;
          bap_id: string;
          bpp_id: string;
          signature_verified: boolean;
          idempotency_key: string;
          request_timestamp: string;
          response_status: "acknowledged" | "nack" | "failed" | "timeout";
          error_code: string | null;
          error_message: string | null;
          payload_hash: string;
          worker_contact_masked: boolean;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          protocol_type: "ondc" | "onest" | "beckn_generic";
          action: "search" | "on_search" | "select" | "on_select" | "init" | "on_init" | "confirm" | "on_confirm" | "status" | "on_status" | "track" | "on_track" | "cancel" | "on_cancel" | "update" | "on_update";
          transaction_id: string;
          message_id: string;
          bap_id: string;
          bpp_id: string;
          signature_verified?: boolean;
          idempotency_key: string;
          request_timestamp: string;
          response_status: "acknowledged" | "nack" | "failed" | "timeout";
          error_code?: string | null;
          error_message?: string | null;
          payload_hash: string;
          worker_contact_masked?: boolean;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          protocol_type?: "ondc" | "onest" | "beckn_generic";
          action?: "search" | "on_search" | "select" | "on_select" | "init" | "on_init" | "confirm" | "on_confirm" | "status" | "on_status" | "track" | "on_track" | "cancel" | "on_cancel" | "update" | "on_update";
          transaction_id?: string;
          message_id?: string;
          bap_id?: string;
          bpp_id?: string;
          signature_verified?: boolean;
          idempotency_key?: string;
          request_timestamp?: string;
          response_status?: "acknowledged" | "nack" | "failed" | "timeout";
          error_code?: string | null;
          error_message?: string | null;
          payload_hash?: string;
          worker_contact_masked?: boolean;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Relationships: [];
      };
      worker_financial_consents: {
        Row: {
          id: string;
          worker_id: string;
          partner_id: string;
          partner_name: string;
          partner_type: "rbi_regulated_nbfc" | "scheduled_commercial_bank" | "sidbi_micro_lender";
          consented_categories: string[];
          purpose: string;
          data_freshness_days: number;
          valid_until: string;
          is_revoked: boolean;
          revoked_at: string | null;
          revocation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          partner_id: string;
          partner_name: string;
          partner_type: "rbi_regulated_nbfc" | "scheduled_commercial_bank" | "sidbi_micro_lender";
          consented_categories?: string[];
          purpose?: string;
          data_freshness_days?: number;
          valid_until: string;
          is_revoked?: boolean;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          partner_id?: string;
          partner_name?: string;
          partner_type?: "rbi_regulated_nbfc" | "scheduled_commercial_bank" | "sidbi_micro_lender";
          consented_categories?: string[];
          purpose?: string;
          data_freshness_days?: number;
          valid_until?: string;
          is_revoked?: boolean;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      enterprise_sync_logs: {
        Row: {
          id: string;
          contractor_org_id: string;
          system_type: "sap_successfactors" | "oracle_fusion_hcm" | "gem_procurement" | "generic_scim_erp";
          sync_direction: "inbound" | "outbound" | "bidirectional";
          external_job_reference: string | null;
          records_synced: number;
          status: "success" | "partial_success" | "failed" | "blocked_consent_missing";
          idempotency_hash: string;
          anonymized_telemetry: boolean;
          error_summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          contractor_org_id: string;
          system_type: "sap_successfactors" | "oracle_fusion_hcm" | "gem_procurement" | "generic_scim_erp";
          sync_direction: "inbound" | "outbound" | "bidirectional";
          external_job_reference?: string | null;
          records_synced?: number;
          status: "success" | "partial_success" | "failed" | "blocked_consent_missing";
          idempotency_hash: string;
          anonymized_telemetry?: boolean;
          error_summary?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          contractor_org_id?: string;
          system_type?: "sap_successfactors" | "oracle_fusion_hcm" | "gem_procurement" | "generic_scim_erp";
          sync_direction?: "inbound" | "outbound" | "bidirectional";
          external_job_reference?: string | null;
          records_synced?: number;
          status?: "success" | "partial_success" | "failed" | "blocked_consent_missing";
          idempotency_hash?: string;
          anonymized_telemetry?: boolean;
          error_summary?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      live_ecosystem_participants: {
        Row: {
          id: string;
          network_type: "ondc" | "onest" | "gem" | "dsep";
          participant_id: string;
          subscriber_id: string;
          signing_public_key: string;
          enc_public_key: string;
          callback_url: string;
          lifecycle_status: "not_started" | "research" | "prepared" | "submitted" | "awaiting_approval" | "sandbox_active" | "sandbox_validated" | "pre_prod_validated" | "production_approved" | "production_active" | "suspended" | "failed";
          staging_passed: boolean;
          staging_verified_at: string | null;
          pre_prod_passed: boolean;
          pre_prod_verified_at: string | null;
          council_approval_ref: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          network_type: "ondc" | "onest" | "gem" | "dsep";
          participant_id: string;
          subscriber_id: string;
          signing_public_key: string;
          enc_public_key: string;
          callback_url: string;
          lifecycle_status?: "not_started" | "research" | "prepared" | "submitted" | "awaiting_approval" | "sandbox_active" | "sandbox_validated" | "pre_prod_validated" | "production_approved" | "production_active" | "suspended" | "failed";
          staging_passed?: boolean;
          staging_verified_at?: string | null;
          pre_prod_passed?: boolean;
          pre_prod_verified_at?: string | null;
          council_approval_ref?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          network_type?: "ondc" | "onest" | "gem" | "dsep";
          participant_id?: string;
          subscriber_id?: string;
          signing_public_key?: string;
          enc_public_key?: string;
          callback_url?: string;
          lifecycle_status?: "not_started" | "research" | "prepared" | "submitted" | "awaiting_approval" | "sandbox_active" | "sandbox_validated" | "pre_prod_validated" | "production_approved" | "production_active" | "suspended" | "failed";
          staging_passed?: boolean;
          staging_verified_at?: string | null;
          pre_prod_passed?: boolean;
          pre_prod_verified_at?: string | null;
          council_approval_ref?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      enterprise_pilot_engagements: {
        Row: {
          id: string;
          enterprise_name: string;
          enterprise_tax_id: string;
          region_code: string;
          erp_system: "sap_successfactors" | "oracle_fusion" | "gem_contract" | "custom_odata";
          pilot_agreement_ref: string;
          status: "draft" | "consented" | "pilot_active" | "pilot_completed" | "suspended" | "terminated";
          enrolled_worker_count: number;
          consented_roster_count: number;
          synced_records_count: number;
          gem_form_b_certified: boolean;
          pilot_start_date: string | null;
          pilot_end_date: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enterprise_name: string;
          enterprise_tax_id: string;
          region_code?: string;
          erp_system: "sap_successfactors" | "oracle_fusion" | "gem_contract" | "custom_odata";
          pilot_agreement_ref: string;
          status?: "draft" | "consented" | "pilot_active" | "pilot_completed" | "suspended" | "terminated";
          enrolled_worker_count?: number;
          consented_roster_count?: number;
          synced_records_count?: number;
          gem_form_b_certified?: boolean;
          pilot_start_date?: string | null;
          pilot_end_date?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          enterprise_name?: string;
          enterprise_tax_id?: string;
          region_code?: string;
          erp_system?: "sap_successfactors" | "oracle_fusion" | "gem_contract" | "custom_odata";
          pilot_agreement_ref?: string;
          status?: "draft" | "consented" | "pilot_active" | "pilot_completed" | "suspended" | "terminated";
          enrolled_worker_count?: number;
          consented_roster_count?: number;
          synced_records_count?: number;
          gem_form_b_certified?: boolean;
          pilot_start_date?: string | null;
          pilot_end_date?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tool_financing_pilot_applications: {
        Row: {
          id: string;
          worker_id: string;
          nbfc_partner_id: string;
          toolkit_type: "electrical_tooling" | "solar_installation_kit" | "plumbing_kit" | "carpentry_power_set" | "masonry_precision_pack";
          requested_amount: number;
          approved_amount: number | null;
          annual_percentage_rate: number;
          tenure_months: number;
          kfs_disclosed: boolean;
          kfs_hash: string;
          worker_consent_recorded: boolean;
          worker_consent_timestamp: string;
          cooling_off_period_days: number;
          platform_commission_amount: number;
          status: "applied" | "kfs_signed" | "underwriting_review" | "disbursed" | "active_repayment" | "closed" | "rejected" | "cancelled_in_cooling_off";
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          nbfc_partner_id: string;
          toolkit_type: "electrical_tooling" | "solar_installation_kit" | "plumbing_kit" | "carpentry_power_set" | "masonry_precision_pack";
          requested_amount: number;
          approved_amount?: number | null;
          annual_percentage_rate: number;
          tenure_months: number;
          kfs_disclosed?: boolean;
          kfs_hash: string;
          worker_consent_recorded?: boolean;
          worker_consent_timestamp?: string;
          cooling_off_period_days?: number;
          platform_commission_amount?: number;
          status?: "applied" | "kfs_signed" | "underwriting_review" | "disbursed" | "active_repayment" | "closed" | "rejected" | "cancelled_in_cooling_off";
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          nbfc_partner_id?: string;
          toolkit_type?: "electrical_tooling" | "solar_installation_kit" | "plumbing_kit" | "carpentry_power_set" | "masonry_precision_pack";
          requested_amount?: number;
          approved_amount?: number | null;
          annual_percentage_rate?: number;
          tenure_months?: number;
          kfs_disclosed?: boolean;
          kfs_hash?: string;
          worker_consent_recorded?: boolean;
          worker_consent_timestamp?: string;
          cooling_off_period_days?: number;
          platform_commission_amount?: number;
          status?: "applied" | "kfs_signed" | "underwriting_review" | "disbursed" | "active_repayment" | "closed" | "rejected" | "cancelled_in_cooling_off";
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      evidence_registry_records: {
        Row: {
          id: string;
          claim_id: string;
          claim_description: string;
          category: "enterprise_pilot" | "erp_integration" | "ondc_network" | "onest_dsep" | "responsible_finance" | "worker_outcome" | "commercial_revenue" | "regional_gate" | "security_dpdp" | "multi_region_dr" | "observability" | "worker_sovereignty";
          source_system: string;
          evidence_location: string;
          evidence_sha256: string;
          collection_timestamp: string;
          verification_timestamp: string | null;
          verifier_role: string;
          scope_and_limitations: string;
          expiry_date: string | null;
          status: "unverified" | "self_reported" | "system_observed" | "partner_confirmed" | "independently_verified" | "expired" | "disputed" | "rejected" | "revoked";
          is_public_safe: boolean;
          redacted_summary: string;
          claim_owner: string | null;
          verifier_identity: string | null;
          verification_method: string | null;
          revocation_reason: string | null;
          access_classification: "public" | "internal" | "confidential" | "restricted";
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          claim_id: string;
          claim_description: string;
          category: "enterprise_pilot" | "erp_integration" | "ondc_network" | "onest_dsep" | "responsible_finance" | "worker_outcome" | "commercial_revenue" | "regional_gate" | "security_dpdp" | "multi_region_dr" | "observability" | "worker_sovereignty";
          source_system: string;
          evidence_location: string;
          evidence_sha256: string;
          collection_timestamp?: string;
          verification_timestamp?: string | null;
          verifier_role?: string;
          scope_and_limitations: string;
          expiry_date?: string | null;
          status?: "unverified" | "self_reported" | "system_observed" | "partner_confirmed" | "independently_verified" | "expired" | "disputed" | "rejected" | "revoked";
          is_public_safe?: boolean;
          redacted_summary: string;
          claim_owner?: string | null;
          verifier_identity?: string | null;
          verification_method?: string | null;
          revocation_reason?: string | null;
          access_classification?: "public" | "internal" | "confidential" | "restricted";
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          claim_id?: string;
          claim_description?: string;
          category?: "enterprise_pilot" | "erp_integration" | "ondc_network" | "onest_dsep" | "responsible_finance" | "worker_outcome" | "commercial_revenue" | "regional_gate" | "security_dpdp" | "multi_region_dr" | "observability" | "worker_sovereignty";
          source_system?: string;
          evidence_location?: string;
          evidence_sha256?: string;
          collection_timestamp?: string;
          verification_timestamp?: string | null;
          verifier_role?: string;
          scope_and_limitations?: string;
          expiry_date?: string | null;
          status?: "unverified" | "self_reported" | "system_observed" | "partner_confirmed" | "independently_verified" | "expired" | "disputed" | "rejected" | "revoked";
          is_public_safe?: boolean;
          redacted_summary?: string;
          claim_owner?: string | null;
          verifier_identity?: string | null;
          verification_method?: string | null;
          revocation_reason?: string | null;
          access_classification?: "public" | "internal" | "confidential" | "restricted";
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      worker_outcome_milestones: {
        Row: {
          id: string;
          worker_id: string;
          opportunity_id: string | null;
          milestone_step: "opportunity_received" | "opportunity_accepted" | "booking_confirmed" | "work_started" | "work_commenced" | "work_completed" | "worker_confirmed_completion" | "customer_confirmed" | "gross_wages_agreed" | "gross_wages_paid" | "payment_evidence" | "disputed" | "resolution" | "reversal_correction" | "retracted";
          agreed_wage_amount: number | null;
          paid_wage_amount: number | null;
          platform_commission_amount: number;
          provenance_state: "self_reported" | "worker_confirmed" | "customer_confirmed" | "payment_documented" | "independently_verified" | "disputed" | "retracted";
          payment_evidence_ref: string | null;
          payment_evidence_hash: string | null;
          dispute_reason: string | null;
          milestone_timestamp: string;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          opportunity_id?: string | null;
          milestone_step: "opportunity_received" | "opportunity_accepted" | "booking_confirmed" | "work_started" | "work_commenced" | "work_completed" | "worker_confirmed_completion" | "customer_confirmed" | "gross_wages_agreed" | "gross_wages_paid" | "payment_evidence" | "disputed" | "resolution" | "reversal_correction" | "retracted";
          agreed_wage_amount?: number | null;
          paid_wage_amount?: number | null;
          platform_commission_amount?: number;
          provenance_state?: "self_reported" | "worker_confirmed" | "customer_confirmed" | "payment_documented" | "independently_verified" | "disputed" | "retracted";
          payment_evidence_ref?: string | null;
          payment_evidence_hash?: string | null;
          dispute_reason?: string | null;
          milestone_timestamp?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          opportunity_id?: string | null;
          milestone_step?: "opportunity_received" | "opportunity_accepted" | "booking_confirmed" | "work_started" | "work_commenced" | "work_completed" | "worker_confirmed_completion" | "customer_confirmed" | "gross_wages_agreed" | "gross_wages_paid" | "payment_evidence" | "disputed" | "resolution" | "reversal_correction" | "retracted";
          agreed_wage_amount?: number | null;
          paid_wage_amount?: number | null;
          platform_commission_amount?: number;
          provenance_state?: "self_reported" | "worker_confirmed" | "customer_confirmed" | "payment_documented" | "independently_verified" | "disputed" | "retracted";
          payment_evidence_ref?: string | null;
          payment_evidence_hash?: string | null;
          dispute_reason?: string | null;
          milestone_timestamp?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      evidence_attestation_events: {
        Row: {
          id: string;
          claim_id: string;
          attestation_type: "submitted" | "observed" | "attested" | "rejected" | "disputed" | "clarification_requested" | "revoked" | "expired";
          actor_id: string;
          actor_role: "worker" | "customer" | "contractor" | "enterprise_partner" | "institutional_partner" | "financial_partner" | "credential_issuer" | "independent_auditor" | "platform_admin";
          methodology: string;
          reviewed_artifacts: Record<string, unknown>[];
          scope_and_limitations: string;
          signature_digest: string;
          dual_approved_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          claim_id: string;
          attestation_type: "submitted" | "observed" | "attested" | "rejected" | "disputed" | "clarification_requested" | "revoked" | "expired";
          actor_id: string;
          actor_role: "worker" | "customer" | "contractor" | "enterprise_partner" | "institutional_partner" | "financial_partner" | "credential_issuer" | "independent_auditor" | "platform_admin";
          methodology: string;
          reviewed_artifacts?: Record<string, unknown>[];
          scope_and_limitations: string;
          signature_digest: string;
          dual_approved_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          claim_id?: string;
          attestation_type?: "submitted" | "observed" | "attested" | "rejected" | "disputed" | "clarification_requested" | "revoked" | "expired";
          actor_id?: string;
          actor_role?: "worker" | "customer" | "contractor" | "enterprise_partner" | "institutional_partner" | "financial_partner" | "credential_issuer" | "independent_auditor" | "platform_admin";
          methodology?: string;
          reviewed_artifacts?: Record<string, unknown>[];
          scope_and_limitations?: string;
          signature_digest?: string;
          dual_approved_by?: string | null;
          notes?: string | null;
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
export type WorkforceInvitation = Database["public"]["Tables"]["workforce_invitations"]["Row"];
export type SubscriptionOrder = Database["public"]["Tables"]["subscription_orders"]["Row"];
export type CohortTraineeProgress = Database["public"]["Tables"]["cohort_trainee_progress"]["Row"];
export type InstitutionAuditLog = Database["public"]["Tables"]["institution_audit_logs"]["Row"];
export type CrmContractorLead = Database["public"]["Tables"]["crm_contractor_leads"]["Row"];
export type PaymentWebhookEvent = Database["public"]["Tables"]["payment_webhook_events"]["Row"];
export type WorkerAssociationEvent = Database["public"]["Tables"]["worker_association_events"]["Row"];
export type ContractorTeamMember = Database["public"]["Tables"]["contractor_team_members"]["Row"];
export type ProjectCrewAssignment = Database["public"]["Tables"]["project_crew_assignments"]["Row"];
export type ContractorCustomerHealth = Database["public"]["Tables"]["contractor_customer_health"]["Row"];
export type WorkerIdentityExport = Database["public"]["Tables"]["worker_identity_exports"]["Row"];
export type RegionalExpansionReadiness = Database["public"]["Tables"]["regional_expansion_readiness"]["Row"];
export type OperationalRegion = Database["public"]["Tables"]["operational_regions"]["Row"];
export type RegionalAdministrator = Database["public"]["Tables"]["regional_administrators"]["Row"];
export type WorkerIdentityAccessGrant = Database["public"]["Tables"]["worker_identity_access_grants"]["Row"];
export type IdentityAccessAuditLog = Database["public"]["Tables"]["identity_access_audit_logs"]["Row"];
export type PartnerCrmRecord = Database["public"]["Tables"]["partner_crm_records"]["Row"];
export type WorkforceOpportunity = Database["public"]["Tables"]["workforce_opportunities"]["Row"];
export type WorkerOpportunityApplication = Database["public"]["Tables"]["worker_opportunity_applications"]["Row"];
export type SkillsGapRecommendation = Database["public"]["Tables"]["skills_gap_recommendations"]["Row"];
export type InstitutionalCredential = Database["public"]["Tables"]["institutional_credentials"]["Row"];
export type InstitutionalPartnerApiKey = Database["public"]["Tables"]["institutional_partner_api_keys"]["Row"];
export type WorkerDispute = Database["public"]["Tables"]["worker_disputes"]["Row"];
export type OpportunityFeedbackReport = Database["public"]["Tables"]["opportunity_feedback_reports"]["Row"];
export type RegionalLaunchTransition = Database["public"]["Tables"]["regional_launch_transitions"]["Row"];
export type CrossRegionProjectStaffing = Database["public"]["Tables"]["cross_region_project_staffing"]["Row"];
export type PaymentRecordLedger = Database["public"]["Tables"]["payment_records_ledger"]["Row"];
export type OfflineVerificationLog = Database["public"]["Tables"]["offline_verification_logs"]["Row"];
export type RegionalLaunchMilestone = Database["public"]["Tables"]["regional_launch_milestones"]["Row"];
export type RegionalOperationalIncident = Database["public"]["Tables"]["regional_operational_incidents"]["Row"];
export type InstitutionAuthorizedSignatory = Database["public"]["Tables"]["institution_authorized_signatories"]["Row"];
export type WorkerPrivacySetting = Database["public"]["Tables"]["worker_privacy_settings"]["Row"];
export type FinancialGstLedger = Database["public"]["Tables"]["financial_gst_ledger"]["Row"];
export type RegionalServiceTelemetry = Database["public"]["Tables"]["regional_service_telemetry"]["Row"];
export type RegionalDualApproval = Database["public"]["Tables"]["regional_dual_approvals"]["Row"];
export type ReviewModerationAppeal = Database["public"]["Tables"]["review_moderation_appeals"]["Row"];
export type OperationalIncidentLifecycle = Database["public"]["Tables"]["operational_incidents_lifecycle"]["Row"];
export type FinancialReconciliationException = Database["public"]["Tables"]["financial_reconciliation_exceptions"]["Row"];
export type RegionalOperationalScorecard = Database["public"]["Tables"]["regional_operational_scorecards"]["Row"];
export type WorkerConsentAuditEvent = Database["public"]["Tables"]["worker_consent_audit_events"]["Row"];
export type RegionalNetworkLiquiditySnapshot = Database["public"]["Tables"]["regional_network_liquidity_snapshots"]["Row"];
export type WorkerPayoutConfirmation = Database["public"]["Tables"]["worker_payout_confirmations"]["Row"];
export type ContractorCustomerSuccessEvent = Database["public"]["Tables"]["contractor_customer_success_events"]["Row"];
export type InstitutionalOnboardingLifecycle = Database["public"]["Tables"]["institutional_onboarding_lifecycle"]["Row"];
export type WorkerSupportAssignment = Database["public"]["Tables"]["worker_support_assignments"]["Row"];
export type AnalyticsProvenanceEvent = Database["public"]["Tables"]["analytics_provenance_events"]["Row"];
export type MetricEvidenceRecord = Database["public"]["Tables"]["metric_evidence_records"]["Row"];
export type WorkerOutcomeCohort = Database["public"]["Tables"]["worker_outcome_cohorts"]["Row"];
export type StateLaunchGateEvaluation = Database["public"]["Tables"]["state_launch_gate_evaluations"]["Row"];
export type ExternalEcosystemTransaction = Database["public"]["Tables"]["external_ecosystem_transactions"]["Row"];
export type WorkerFinancialConsent = Database["public"]["Tables"]["worker_financial_consents"]["Row"];
export type EnterpriseSyncLog = Database["public"]["Tables"]["enterprise_sync_logs"]["Row"];
export type LiveEcosystemParticipant = Database["public"]["Tables"]["live_ecosystem_participants"]["Row"];
export type EnterprisePilotEngagement = Database["public"]["Tables"]["enterprise_pilot_engagements"]["Row"];
export type ToolFinancingPilotApplication = Database["public"]["Tables"]["tool_financing_pilot_applications"]["Row"];
export type EvidenceRegistryRecord = Database["public"]["Tables"]["evidence_registry_records"]["Row"];
export type WorkerOutcomeMilestone = Database["public"]["Tables"]["worker_outcome_milestones"]["Row"];
export type EvidenceAttestationEvent = Database["public"]["Tables"]["evidence_attestation_events"]["Row"];



