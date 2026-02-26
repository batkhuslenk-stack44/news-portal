import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://poulcejdgwyzmvjysqew.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14'
);

async function setup() {
    console.log('🔧 Creating testimony tables...\n');

    // Try to create table via rpc
    const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
    });

    if (sqlError) {
        console.log('⚠️ rpc exec_sql not available:', sqlError.message);
        console.log('\n📋 Trying to insert test data directly...');
    } else {
        console.log('✅ Tables created via SQL!');
    }

    // Test if tables exist by trying to select
    const { data: testData, error: testError } = await supabase
        .from('testimonies')
        .select('id')
        .limit(1);

    if (testError) {
        console.log('❌ testimonies table does NOT exist:', testError.message);
        console.log('\n=========================================');
        console.log('📋 ЗААВАЛ ХИЙХ ЗҮЙЛ:');
        console.log('=========================================');
        console.log('1. Энэ линк руу ороорой:');
        console.log('   https://supabase.com/dashboard/project/poulcejdgwyzmvjysqew/sql/new');
        console.log('');
        console.log('2. Доорх SQL-ийг copy paste хийгээд Run дарна уу:');
        console.log('=========================================\n');
        console.log(`CREATE TABLE IF NOT EXISTS testimonies (
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
CREATE POLICY "Testimonies are viewable by everyone" ON testimonies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert testimonies" ON testimonies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own testimonies" ON testimonies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own testimonies" ON testimonies FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS testimony_likes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testimony_id BIGINT REFERENCES testimonies(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(testimony_id, user_id)
);
ALTER TABLE testimony_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" ON testimony_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert likes" ON testimony_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON testimony_likes FOR DELETE USING (auth.uid() = user_id);`);
    } else {
        console.log('✅ testimonies table EXISTS! Current rows:', testData?.length || 0);

        const { data: likesData, error: likesError } = await supabase
            .from('testimony_likes')
            .select('id')
            .limit(1);

        if (likesError) {
            console.log('❌ testimony_likes table missing:', likesError.message);
        } else {
            console.log('✅ testimony_likes table EXISTS!');
        }

        console.log('\n🎉 DONE! Tables are ready!');
    }
}

setup();
