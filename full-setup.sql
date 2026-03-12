-- ========================================================
-- CONSOLIDATED MIGRATION: CHURCHES & PRAYERS
-- Run this in Supabase Dashboard → SQL Editor
-- ========================================================

-- 1. CHURCHES TABLE
CREATE TABLE IF NOT EXISTS churches (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  members_count INTEGER DEFAULT 0,
  activities TEXT NOT NULL,
  address TEXT NOT NULL,
  location_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Churches are viewable by everyone" ON churches
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can register churches" ON churches
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own church" ON churches
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own church" ON churches
  FOR DELETE USING (auth.uid() = owner_id);

-- 2. CHURCH NEWS TABLE
CREATE TABLE IF NOT EXISTS church_news (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  church_id BIGINT REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE church_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Church news are viewable by everyone" ON church_news
  FOR SELECT USING (true);

CREATE POLICY "Church owners can insert news" ON church_news
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM churches
      WHERE id = church_news.church_id AND owner_id = auth.uid()
    )
  );

-- 3. PRAYERS TABLE
CREATE TABLE IF NOT EXISTS prayers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prayers are viewable by everyone" ON prayers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert prayers" ON prayers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayers" ON prayers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayers" ON prayers
  FOR DELETE USING (auth.uid() = user_id);

-- 4. PRAYER LIKES TABLE
CREATE TABLE IF NOT EXISTS prayer_likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prayer_id BIGINT REFERENCES prayers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prayer_id, user_id)
);

ALTER TABLE prayer_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prayer Likes are viewable by everyone" ON prayer_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert prayer likes" ON prayer_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayer likes" ON prayer_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. PRAYER COMMENTS TABLE
CREATE TABLE IF NOT EXISTS prayer_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prayer_id BIGINT REFERENCES prayers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prayer_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prayer Comments are viewable by everyone" ON prayer_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert prayer comments" ON prayer_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayer comments" ON prayer_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 6. ENSURE STORAGE BUCKET POLICIES (If missing)
-- (Make sure 'news-images' bucket is set to Public in Supabase Dashboard)
