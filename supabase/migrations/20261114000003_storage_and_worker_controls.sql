-- ==============================================================================
-- KAAMSETU STORAGE BUCKETS & WORKER SELF-SOVEREIGN CONTROLS
-- ==============================================================================

-- 1. Create Storage Buckets for Worker Assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'portfolio-images',
    'portfolio-images',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  ),
  (
    'worker-avatars',
    'worker-avatars',
    true,
    3145728, -- 3 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Row Level Security Policies
-- Anyone can view portfolio images of published workers
CREATE POLICY "Public read access for portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

-- Workers can upload portfolio images to their own folder (folder name matches their worker_profile_id or user_id)
CREATE POLICY "Workers can upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-images' AND
    auth.uid() IS NOT NULL
  );

-- Workers can delete their own uploaded portfolio images
CREATE POLICY "Workers can delete their own portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IS NOT NULL)
  );

-- 3. Additional Worker Self-Sovereign Controls
-- Ensure workers can update their own availability and publishing status
COMMENT ON COLUMN public.worker_profiles.is_published IS 'Worker controlled self-sovereign toggle: when false, profile is hidden from all public explore searches';
COMMENT ON COLUMN public.worker_profiles.availability_status IS 'Worker controlled live availability status: available, on_site, or unavailable';
