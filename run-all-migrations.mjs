import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://poulcejdgwyzmvjysqew.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14'
);

const sql = `
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

CREATE TABLE IF NOT EXISTS testimony_likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  testimony_id BIGINT REFERENCES testimonies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(testimony_id, user_id)
);

ALTER TABLE testimony_likes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS testimony_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  testimony_id BIGINT REFERENCES testimonies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimony_comments ENABLE ROW LEVEL SECURITY;
`;

async function run() {
    console.log('Running migration...');
    const baseUrl = 'https://poulcejdgwyzmvjysqew.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14';

    // Try /pg/query
    try {
        const res = await fetch(baseUrl + '/pg/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + serviceKey, 'apikey': serviceKey },
            body: JSON.stringify({ query: sql })
        });
        console.log('/pg/query status:', res.status);
        if (res.ok) {
            console.log('Tables created via /pg/query!');
            await verify();
            return;
        }
        console.log(await res.text());
    } catch (e) { console.log('/pg/query error:', e.message); }

    // Try rpc
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (!error) {
        console.log('Tables created via rpc!');
        await verify();
        return;
    }
    console.log('rpc error:', error.message);

    // All failed
    console.log('\\nAPI ажиллахгүй байна.');
    console.log('Supabase Dashboard-аас шууд SQL ажиллуулна уу:');
    console.log('https://supabase.com/dashboard/project/poulcejdgwyzmvjysqew/sql/new');
}

async function verify() {
    for (const t of ['testimonies', 'testimony_likes', 'testimony_comments']) {
        const { error } = await supabase.from(t).select('id').limit(1);
        console.log(error ? 'MISSING ' + t : 'OK ' + t);
    }
}

run().catch(e => console.error(e));
