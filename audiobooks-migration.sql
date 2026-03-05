CREATE TABLE IF NOT EXISTS audiobooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Unknown',
    audio_url TEXT NOT NULL,
    link_url TEXT,
    description TEXT,
    cover_image TEXT,
    category TEXT DEFAULT 'Библи',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audiobooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read audiobooks" ON audiobooks FOR SELECT USING (true);
CREATE POLICY "Auth users can insert audiobooks" ON audiobooks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own audiobooks" ON audiobooks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own audiobooks" ON audiobooks FOR DELETE TO authenticated USING (auth.uid() = user_id);