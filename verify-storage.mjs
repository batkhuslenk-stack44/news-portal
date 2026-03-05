import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poulcejdgwyzmvjysqew.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14';

const supabase = createClient(supabaseUrl, serviceKey);

async function verifyPolicies() {
    console.log('--- Verifying Storage Policies ---');

    // Try to upload a tiny dummy file to check access (using service role, so it might bypass but let's see)
    const buckets = ['worship-songs', 'audiobooks'];

    for (const bucket of buckets) {
        console.log(`Checking bucket: ${bucket}`);

        // Check if we can see the bucket configuration
        const { data: bData, error: bError } = await supabase.storage.getBucket(bucket);
        if (bError) {
            console.log(`❌ Error getting bucket ${bucket}: ${bError.message}`);
        } else {
            console.log(`✅ Bucket ${bucket} is public: ${bData.public}`);
        }
    }

    // We can't easily check 'policies' directly via RPC without exec_sql
    // But we can check if the buckets are marked as public
}

verifyPolicies().catch(e => console.error(e));
