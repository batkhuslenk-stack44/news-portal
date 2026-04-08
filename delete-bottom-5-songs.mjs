import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poulcejdgwyzmvjysqew.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function deleteBottom5Songs() {
  const { data: songs, error: fetchError } = await supabaseAdmin
    .from('worship_songs')
    .select('id, title, created_at')
    .order('created_at', { ascending: true }) // Oldest first
    .limit(5);

  if (fetchError) {
    console.error('Error fetching songs:', fetchError.message);
    return;
  }

  if (songs && songs.length > 0) {
    console.log(`Found ${songs.length} oldest songs to delete:`);
    for (const song of songs) {
      console.log(`- ${song.title} (ID: ${song.id}, created at: ${song.created_at})`);
      
      const { error: deleteError } = await supabaseAdmin
        .from('worship_songs')
        .delete()
        .eq('id', song.id);
        
      if (deleteError) {
        console.error(`  Failed to delete ${song.title}:`, deleteError.message);
      } else {
        console.log(`  Successfully deleted ${song.title}`);
      }
    }
    console.log('Finished deleting specified songs.');
  } else {
    console.log('No songs found in the database.');
  }
}

deleteBottom5Songs();
