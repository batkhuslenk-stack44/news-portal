// Try to create table via Supabase SQL endpoint using service_role key
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14';
const base = 'https://poulcejdgwyzmvjysqew.supabase.co';

const createTableSQL = `
CREATE TABLE IF NOT EXISTS worship_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Unknown',
    audio_url TEXT NOT NULL,
    audio_type TEXT DEFAULT 'audio',
    lyrics TEXT,
    cover_image TEXT,
    category TEXT DEFAULT E'\\u041c\\u0430\\u0433\\u0442\\u0430\\u0430\\u043b',
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE worship_songs ENABLE ROW LEVEL SECURITY;
`;

async function run() {
  // First, try to create an exec_sql function via the service role
  console.log('Step 1: Creating exec_sql function...');

  // Use the /rest/v1/rpc endpoint to check existing functions
  const createFnRes = await fetch(base + '/rest/v1/rpc/exec_sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': 'Bearer ' + serviceKey,
    },
    body: JSON.stringify({ sql: 'SELECT 1' })
  });
  console.log('exec_sql check:', createFnRes.status);

  if (createFnRes.status === 404) {
    console.log('exec_sql function does not exist.');
    console.log('');

    // Check all available endpoints
    const endpoints = [
      '/rest/v1/',
      '/graphql/v1',
    ];

    for (const ep of endpoints) {
      try {
        const r = await fetch(base + ep, {
          headers: { 'apikey': serviceKey, 'Authorization': 'Bearer ' + serviceKey }
        });
        console.log(`${ep} => ${r.status}`);
      } catch (e) {
        console.log(`${ep} => error: ${e.message}`);
      }
    }
  }

  // Try to use PostgREST to check if table exists already
  console.log('\nStep 2: Checking if table already exists...');
  const checkRes = await fetch(base + '/rest/v1/worship_songs?select=count', {
    method: 'HEAD',
    headers: { 'apikey': serviceKey, 'Authorization': 'Bearer ' + serviceKey }
  });
  console.log('Table check status:', checkRes.status);

  if (checkRes.status === 200) {
    console.log('✅ Table already exists!');
    await insertData();
    return;
  }

  // Table doesn't exist - output the SQL for manual execution
  console.log('\n❌ Table does not exist and cannot create via API.');
  console.log('\n========================================');
  console.log('MANUAL STEP REQUIRED');
  console.log('========================================');
  console.log('Go to: https://supabase.com/dashboard/project/poulcejdgwyzmvjysqew/sql/new');
  console.log('And paste the contents of worship-songs-migration.sql');
  console.log('========================================\n');

  // Open browser as a convenience
  const { exec } = await import('child_process');
  exec('start https://supabase.com/dashboard/project/poulcejdgwyzmvjysqew/sql/new');
  console.log('🌐 Opening Supabase SQL Editor in your browser...');
}

async function insertData() {
  console.log('Inserting sample songs...');
  const songs = [
    {
      title: 'Бурханы хайр',
      artist: 'Итгэлийн Зам',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audio_type: 'audio',
      lyrics: 'Бурханы хайр намайг хүрээлдэг\nТүүний нигүүлсэл өдөр бүр шинэ\nБи Түүний хүүхэд, Тэр миний Эцэг\nХайрын дууг би дуулна мөнхөд\n\n[Давталт]\nМагтаал, магтаал, магтаал\nБурханд магтаал өргөе\nМагтаал, магтаал, магтаал\nЗүрхнээсээ дуулъя',
      category: 'Магтаал'
    },
    {
      title: 'Аврагч Есүс',
      artist: 'Итгэлийн Зам',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      audio_type: 'audio',
      category: 'Магтаал'
    },
    {
      title: 'Залбирлын цаг',
      artist: 'Итгэлийн Зам',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      audio_type: 'audio',
      lyrics: 'Залбирлын цаг ирлээ\nЗүрхээ нээж дуулъя\nЭзэний өмнө зогсож\nТэнгэрийн хаанд магтаал\n\nБи чамд итгэнэ, Эзэн\nБи чамд найдна, Бурхан\nМиний залбирлыг сонс\nМиний дуудлагыг хар',
      category: 'Залбирал'
    },
    {
      title: 'Итгэлийн зам',
      artist: 'Итгэлийн Зам',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      audio_type: 'audio',
      lyrics: 'Итгэлийн замаар алхъя\nБурханы гэрэлд явъя\nХаранхуй ч байсан гэсэн\nТэр миний зам гэрэлтүүлнэ\n\n[Давталт]\nАлхъя, алхъя\nИтгэлийн замаар алхъя\nДуулъя, дуулъя\nБаяр хөөрийн дууг дуулъя',
      category: 'Гэрчлэл'
    },
    {
      title: 'Шинэ өглөө',
      artist: 'Итгэлийн Зам',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      audio_type: 'audio',
      category: 'Магтаал'
    }
  ];

  const res = await fetch(base + '/rest/v1/worship_songs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': 'Bearer ' + serviceKey,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(songs)
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`✅ Inserted ${data.length} songs!`);
    data.forEach(s => console.log(`  🎵 [${s.category}] ${s.title}`));
  } else {
    const text = await res.text();
    console.log('Insert result:', res.status, text.substring(0, 200));
  }
}

run().catch(e => console.error(e));
