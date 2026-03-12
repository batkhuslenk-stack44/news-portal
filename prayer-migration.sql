-- ============================================
-- PRAYER FEATURE: Migration
-- ============================================

-- 1. Create prayers table
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

-- 2. Create prayer_likes table
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

-- 3. Create prayer_comments table
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
