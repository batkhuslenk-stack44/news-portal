-- ============================================
-- CHURCHES: Migration for Church Profiles and News
-- ============================================

-- 1. Create churches table
CREATE TABLE IF NOT EXISTS churches (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  members_count INTEGER DEFAULT 0,
  activities TEXT NOT NULL,
  address TEXT NOT NULL,
  location_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create church_news table
CREATE TABLE IF NOT EXISTS church_news (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  church_id BIGINT REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_news ENABLE ROW LEVEL SECURITY;

-- 4. Church policies
CREATE POLICY "Churches are viewable by everyone" ON churches
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can register a church" ON churches
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own church" ON churches
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own church" ON churches
  FOR DELETE USING (auth.uid() = owner_id);

-- 5. Church news policies
CREATE POLICY "Church news are viewable by everyone" ON church_news
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage news for their church" ON church_news
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM churches
      WHERE churches.id = church_news.church_id
      AND churches.owner_id = auth.uid()
    )
  );

-- 6. Storage Bucket for church images
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-images', 'church-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read church images" ON storage.objects
  FOR SELECT USING (bucket_id = 'church-images');

CREATE POLICY "Any authenticated can upload church images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'church-images' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can update church images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'church-images' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can delete church images" ON storage.objects
  FOR DELETE USING (bucket_id = 'church-images' AND auth.role() = 'authenticated');
