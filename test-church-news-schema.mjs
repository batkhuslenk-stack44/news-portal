import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://poulcejdgwyzmvjysqew.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14'
);

async function run() {
    const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE church_news ADD COLUMN IF NOT EXISTS youtube_url TEXT;`
    });
    console.log("SQL Error:", sqlError);
}
run();
