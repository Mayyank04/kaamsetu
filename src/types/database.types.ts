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
