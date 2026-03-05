-- Run this in your Supabase SQL Editor
-- This will allow authenticated users to upload files to 'worship-songs' and 'audiobooks' buckets.

-- 1. Policies for 'worship-songs' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'worship-songs');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'worship-songs');
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'worship-songs');
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'worship-songs');

-- 2. Policies for 'audiobooks' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'audiobooks');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audiobooks');
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'audiobooks');
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'audiobooks');

-- 3. Ensure buckets are public (if not already set via dashboard)
UPDATE storage.buckets SET public = true WHERE id IN ('worship-songs', 'audiobooks');
