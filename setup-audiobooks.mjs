const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14';
const base = 'https://poulcejdgwyzmvjysqew.supabase.co';

// First copy the SQL to clipboard for the user to run
const sql = `
CREATE TABLE IF NOT EXISTS audiobooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Unknown',
    audio_url TEXT NOT NULL,
    link_url TEXT,
    description TEXT,
    cover_image TEXT,
    category TEXT DEFAULT 'Библи',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audiobooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read audiobooks" ON audiobooks FOR SELECT USING (true);
CREATE POLICY "Auth users can insert audiobooks" ON audiobooks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own audiobooks" ON audiobooks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own audiobooks" ON audiobooks FOR DELETE TO authenticated USING (auth.uid() = user_id);
`;

async function run() {
    // Check if table exists
    console.log('Checking audiobooks table...');
    const check = await fetch(base + '/rest/v1/audiobooks?select=id&limit=1', {
        headers: { 'apikey': serviceKey, 'Authorization': 'Bearer ' + serviceKey }
    });

    if (check.status === 200) {
        console.log('✅ Table exists!');
        await insertData();
        return;
    }

    console.log('❌ Table does not exist. Copying SQL to clipboard...');

    // Write SQL file
    const fs = await import('fs');
    fs.writeFileSync('audiobooks-migration.sql', sql.trim());
    console.log('📄 audiobooks-migration.sql файл үүсгэгдлээ');

    // Copy to clipboard
    const { exec } = await import('child_process');
    exec('Get-Content audiobooks-migration.sql | Set-Clipboard', { shell: 'powershell' }, (err) => {
        if (!err) console.log('📋 SQL clipboard-руу хуулагдлаа!');
    });

    // Open browser
    exec('start https://supabase.com/dashboard/project/poulcejdgwyzmvjysqew/sql/new');
    console.log('🌐 Supabase SQL Editor нээгдэж байна...');
    console.log('');
    console.log('Ctrl+V дарж paste хийгээд Run дарна уу!');
    console.log('Дараа нь: node setup-audiobooks.mjs  ажиллуулна уу');
}

async function insertData() {
    const check = await fetch(base + '/rest/v1/audiobooks?select=id', {
        headers: { 'apikey': serviceKey, 'Authorization': 'Bearer ' + serviceKey }
    });
    const existing = await check.json();

    if (existing.length > 0) {
        console.log(`Аль хэдийн ${existing.length} ном байна.`);
        return;
    }

    console.log('Inserting sample audiobooks...');
    const books = [
        {
            title: 'Библийн түүхүүд - Эхлэл ном',
            author: 'Итгэлийн Зам',
            audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
            description: 'Библийн Эхлэл номын гол түүхүүдийг Монгол хэл дээр уншсан аудио ном. Бурхан дэлхийг бүтээсэн түүхээс эхлэн Иосефын амьдрал хүртэл.',
            category: 'Библи'
        },
        {
            title: 'Есүсийн сургаалуудаас',
            author: 'Итгэлийн Зам',
            audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
            description: 'Есүс Христийн амьдрал дахь гол сургаалууд, сэтгэлд хоногших үгс, амьдралын удирдамж.',
            category: 'Сургаал'
        },
        {
            title: 'Залбирлын хүч',
            author: 'Итгэлийн Зам',
            audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
            description: 'Залбирлын хүчний тухай номлол. Бурхантай хэрхэн ярилцах, залбирлын амьдралаа хэрхэн баяжуулах тухай.',
            category: 'Залбирал'
        },
        {
            title: 'Итгэлийн баатрууд',
            author: 'Итгэлийн Зам',
            audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
            description: 'Библи дэх итгэлийн баатруудын амьдрал — Абрахам, Мосе, Давид нарын түүхүүд.',
            category: 'Гэрчлэл'
        },
        {
            title: 'Өдөр бүрийн номлол',
            author: 'Итгэлийн Зам',
            audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
            description: 'Өдөр бүр сонсох богино номлолууд. Итгэлийг бэхжүүлэх, сэтгэлд тайвшрал авчрах үгс.',
            category: 'Номлол'
        }
    ];

    const res = await fetch(base + '/rest/v1/audiobooks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': 'Bearer ' + serviceKey,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(books)
    });

    if (res.ok) {
        const data = await res.json();
        console.log(`✅ ${data.length} audiobooks inserted!`);
        data.forEach(b => console.log(`  📚 [${b.category}] ${b.title}`));
    } else {
        console.log('❌', res.status, await res.text());
    }
}

run().catch(e => console.error(e));
