import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poulcejdgwyzmvjysqew.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14';

const supabase = createClient(supabaseUrl, serviceKey);

async function setStoragePolicies() {
    console.log('--- Setting Storage Policies ---');

    const buckets = ['worship-songs', 'audiobooks'];

    for (const bucket of buckets) {
        console.log(`Setting policies for bucket: ${bucket}`);

        const sql = `
      -- 1. Allow public access to view files
      CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = '${bucket}');
      
      -- 2. Allow authenticated users to upload files
      CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = '${bucket}');
      
      -- 3. Allow users to update/delete their own files (simple version: allow authenticated to do anything in the bucket)
      CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = '${bucket}');
      CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = '${bucket}');
    `;

        // We need to use exec_sql if it exists, or just explain to the user.
        // Try to use rpc('exec_sql')
        const { error } = await supabase.rpc('exec_sql', { sql });

        if (error) {
            console.error(`Failed to set policies for ${bucket} via RPC:`, error.message);
            console.log('\nMANUAL STEPS REQUIRED:');
            console.log('Go to Supabase Dashboard -> SQL Editor and run:');
            console.log(sql);
        } else {
            console.log(`✅ Policies set for bucket "${bucket}".`);
        }
    }
}

setStoragePolicies().catch(e => console.error(e));
