import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/it hicheel/web/news-portal/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseServiceKey?.length);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testDelete() {
  const { data: songs } = await supabaseAdmin.from('worship_songs').select('id, title').limit(1);
  if (songs && songs.length > 0) {
    const songId = songs[0].id;
    console.log('Attempting to delete song:', songs[0].title, songId);

    const { error } = await supabaseAdmin.from('worship_songs').delete().eq('id', songId);
    if (error) {
      console.error('Delete failed:', error.message);
    } else {
      console.log('Delete successful!');
    }
  } else {
    console.log('No songs found to delete.');
  }
}.

testDelete();
