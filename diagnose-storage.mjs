import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poulcejdgwyzmvjysqew.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkStorage() {
    console.log('--- Checking Supabase Storage ---');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error.message);
        return;
    }

    console.log('Available buckets:', buckets.map(b => b.name).join(', '));

    const requiredBuckets = ['worship-songs', 'audiobooks'];
    for (const b of requiredBuckets) {
        const bucket = buckets.find(x => x.name === b);
        if (!bucket) {
            console.log(`❌ Bucket "${b}" is missing!`);
            // Create if missing
            const { error: createError } = await supabase.storage.createBucket(b, {
                public: true,
                fileSizeLimit: 100 * 1024 * 1024, // 100MB
            });
            if (createError) console.error(`Failed to create bucket ${b}:`, createError.message);
            else console.log(`✅ Created bucket "${b}".`);
        } else {
            console.log(`✅ Bucket "${b}" exists.`);
        }
    }

    console.log('\n--- Checking Table RLS ---');
    // Check if worship_songs table has user_id
    const { data: cols, error: colError } = await supabase.rpc('exec_sql', {
        sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'worship_songs'"
    });
    if (colError) {
        // exec_sql might not exist, try direct query via rest
        const { data, error } = await supabase.from('worship_songs').select('*').limit(1);
        if (error) console.error('Error fetching from worship_songs:', error.message);
        else console.log('✅ worship_songs table is accessible.');
    } else {
        console.log('Columns in worship_songs:', cols.map(c => c.column_name).join(', '));
    }
}

checkStorage().catch(e => console.error(e));
