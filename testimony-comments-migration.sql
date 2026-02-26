-- ============================================
-- TESTIMONY COMMENTS: Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Create testimony_comments table
CREATE TABLE IF NOT EXISTS testimony_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  testimony_id BIGINT REFERENCES testimonies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimony_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments
CREATE POLICY "Comments are viewable by everyone" ON testimony_comments
  FOR SELECT USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments" ON testimony_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete own comments
CREATE POLICY "Users can delete own comments" ON testimony_comments
  FOR DELETE USING (auth.uid() = user_id);
