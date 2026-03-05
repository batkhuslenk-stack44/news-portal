-- =============================================
-- Worship Songs Table Migration (Updated)
-- Supports: MP3, MP4, user uploads, lyrics
-- =============================================

CREATE TABLE IF NOT EXISTS worship_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Unknown',
    audio_url TEXT NOT NULL,
    audio_type TEXT DEFAULT 'audio',
    lyrics TEXT,
    cover_image TEXT,
    category TEXT DEFAULT 'Магтаал',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE worship_songs ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Anyone can read worship songs"
    ON worship_songs FOR SELECT
    USING (true);

-- Logged in users can add songs
CREATE POLICY "Auth users can insert songs"
    ON worship_songs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Users can update their own songs
CREATE POLICY "Users can update own songs"
    ON worship_songs FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can delete their own songs
CREATE POLICY "Users can delete own songs"
    ON worship_songs FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- Create Storage Bucket (Supabase Dashboard дээр):
-- 1. Storage -> New Bucket -> "worship-songs"
-- 2. Public bucket: ON
-- 3. File size limit: 100MB
-- 4. Allowed MIME types: audio/*, video/mp4
-- =============================================

-- Sample Data
INSERT INTO worship_songs (title, artist, audio_url, audio_type, lyrics, category) VALUES
(
    'Бурханы хайр',
    'Итгэлийн Зам',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'audio',
    'Бурханы хайр намайг хүрээлдэг
Түүний нигүүлсэл өдөр бүр шинэ
Би Түүний хүүхэд, Тэр миний Эцэг
Хайрын дууг би дуулна мөнхөд

[Давталт]
Магтаал, магтаал, магтаал
Бурханд магтаал өргөе
Магтаал, магтаал, магтаал
Зүрхнээсээ дуулъя',
    'Магтаал'
),
(
    'Аврагч Есүс',
    'Итгэлийн Зам',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'audio',
    NULL,
    'Магтаал'
),
(
    'Залбирлын цаг',
    'Итгэлийн Зам',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'audio',
    'Залбирлын цаг ирлээ
Зүрхээ нээж дуулъя
Эзэний өмнө зогсож
Тэнгэрийн хаанд магтаал

Би чамд итгэнэ, Эзэн
Би чамд найдна, Бурхан
Миний залбирлыг сонс
Миний дуудлагыг хар',
    'Залбирал'
),
(
    'Итгэлийн зам',
    'Итгэлийн Зам',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'audio',
    'Итгэлийн замаар алхъя
Бурханы гэрэлд явъя
Харанхуй ч байсан гэсэн
Тэр миний зам гэрэлтүүлнэ

[Давталт]
Алхъя, алхъя
Итгэлийн замаар алхъя
Дуулъя, дуулъя
Баяр хөөрийн дууг дуулъя',
    'Гэрчлэл'
),
(
    'Шинэ өглөө',
    'Итгэлийн Зам',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'audio',
    NULL,
    'Магтаал'
);
