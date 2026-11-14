-- ============================================================================
-- KAAMSETU SOVEREIGN DIGITAL IDENTITY PLATFORM
-- Migration 02: Row Level Security (RLS) & Fine-Grained Access Control
-- Target: PostgreSQL 15+ / Supabase
-- ============================================================================

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. PROFILES POLICIES
-- ============================================================================
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. OCCUPATIONS POLICIES (Public Reference Data)
-- ============================================================================
CREATE POLICY "Active occupations are viewable by everyone"
  ON public.occupations FOR SELECT
  USING (is_active = true);

-- Modifying occupations is reserved for service role / admin
CREATE POLICY "Admin can modify occupations"
  ON public.occupations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. SKILLS POLICIES (Public Reference Data)
-- ============================================================================
CREATE POLICY "Skills are viewable by everyone"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Admin can modify skills"
  ON public.skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 4. WORKER PROFILES POLICIES
-- Rule: Public read access ONLY to published profiles (is_published = true).
-- Workers can view, create and edit their own profile even if unpublished (draft).
-- ============================================================================
CREATE POLICY "Public read access only to published worker profiles"
  ON public.worker_profiles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Workers can view own profile regardless of published state"
  ON public.worker_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Workers can create their own worker profile"
  ON public.worker_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workers can update their own worker profile"
  ON public.worker_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workers can delete their own worker profile"
  ON public.worker_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. WORKER SKILLS POLICIES
-- ============================================================================
CREATE POLICY "Public can view skills of published workers or own profile"
  ON public.worker_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_skills.worker_profile_id
        AND (wp.is_published = true OR wp.user_id = auth.uid())
    )
  );

CREATE POLICY "Workers can manage their own skills"
  ON public.worker_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_skills.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = worker_skills.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. PORTFOLIO POLICIES
-- Rule: Private portfolio management for workers; public read only for published.
-- ============================================================================
CREATE POLICY "Public read portfolio only for published workers"
  ON public.portfolio FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = portfolio.worker_profile_id
        AND (wp.is_published = true OR wp.user_id = auth.uid())
    )
  );

CREATE POLICY "Workers can insert into own portfolio"
  ON public.portfolio FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = portfolio.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Workers can update own portfolio"
  ON public.portfolio FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = portfolio.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = portfolio.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Workers can delete from own portfolio"
  ON public.portfolio FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = portfolio.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. BOOKINGS POLICIES
-- Rule: Strict booking ownership. Customers see and create their bookings.
-- Assigned workers can view and update their assigned bookings.
-- ============================================================================
CREATE POLICY "Customers and assigned workers can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = bookings.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('customer', 'contractor', 'admin')
    )
  );

CREATE POLICY "Customers and assigned workers can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = bookings.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = bookings.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. REVIEWS POLICIES
-- Rule: Customer review eligibility requires a COMPLETED booking with that worker!
-- Public can view reviews of published worker profiles.
-- ============================================================================
CREATE POLICY "Public can view reviews of published workers"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = reviews.worker_profile_id
        AND wp.is_published = true
    )
  );

CREATE POLICY "Only eligible customers with completed bookings can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reviews.booking_id
        AND b.customer_id = auth.uid()
        AND b.worker_profile_id = reviews.worker_profile_id
        AND b.status = 'completed'::public.booking_status
    )
  );

CREATE POLICY "Customers can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = customer_id);

-- ============================================================================
-- 9. WORK RECORDS POLICIES
-- ============================================================================
CREATE POLICY "Public can view verified work records of published workers"
  ON public.work_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = work_records.worker_profile_id
        AND (wp.is_published = true OR wp.user_id = auth.uid())
    )
  );

CREATE POLICY "Workers can manage their own work records"
  ON public.work_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = work_records.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.worker_profiles wp
      WHERE wp.id = work_records.worker_profile_id
        AND wp.user_id = auth.uid()
    )
  );
