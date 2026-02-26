-- ============================================
-- TESTIMONY FEATURE: Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Create testimonies table
CREATE TABLE IF NOT EXISTS testimonies (
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

ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonies are viewable by everyone" ON testimonies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert testimonies" ON testimonies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own testimonies" ON testimonies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own testimonies" ON testimonies
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Create testimony_likes table
CREATE TABLE IF NOT EXISTS testimony_likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  testimony_id BIGINT REFERENCES testimonies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(testimony_id, user_id)
);

ALTER TABLE testimony_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" ON testimony_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert likes" ON testimony_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON testimony_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 3. If table already exists, add new columns
-- (Run these only if you already created the table without these columns)
-- ALTER TABLE testimonies ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
-- ALTER TABLE testimonies ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
-- ALTER TABLE testimonies ADD COLUMN IF NOT EXISTS link_url TEXT DEFAULT '';
