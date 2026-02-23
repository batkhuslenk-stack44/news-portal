import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://poulcejdgwyzmvjysqew.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14'
);

async function setup() {
    console.log('🔧 Creating news table...');

    // Create table using SQL via rpc
    const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
      CREATE TABLE IF NOT EXISTS news (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        image TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    });

    if (sqlError) {
        console.log('⚠️ Table may need to be created via Supabase Dashboard SQL Editor.');
        console.log('Error:', sqlError.message);
        console.log('\n📋 Please go to: https://supabase.com/dashboard/project/poulcejdgwyzmvjysqew/sql/new');
        console.log('And run the SQL from supabase-setup.sql file\n');
        console.log('Trying to insert data assuming table already exists...');
    } else {
        console.log('✅ Table created!');
    }

    // Try inserting seed data
    console.log('\n📰 Inserting seed data...');
    const { data, error } = await supabase.from('news').insert([
        {
            category: 'Сүм чуулган',
            title: 'Улаанбаатар хотод Христийн мэндэлсний баярын нэгдсэн цуглаан амжилттай боллоо',
            excerpt: 'Мянга мянган итгэгчид цуглаж, эв нэгдэл ба хайрын баярыг хамтдаа тэмдэглэн, эх орныхоо төлөө ерөөл өргөв.',
            image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80',
            date: '2026 оны 2-р сарын 22'
        },
        {
            category: 'Библи судлал',
            title: 'Шинэ Библи судлалын хөтөлбөр залуучуудад зориулан гарлаа',
            excerpt: 'Орчин үеийн залууст зориулсан Библийн сургааль ба амьдралын практик хөтөлбөр цахим хэлбэрээр хүрч эхлэв.',
            image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80',
            date: '2026 оны 2-р сарын 21'
        },
        {
            category: 'Гэрчлэл',
            title: 'Итгэл сэтгэл: Амьдралын хүнд давааг Бурханы тусламжтай хэрхэн давсан бэ?',
            excerpt: 'Нэгэн итгэгч ахын маань амьдралд тохиолдсон гайхамшигт өөрчлөлт ба Бурханы хайрын тухай түүх.',
            image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
            date: '2026 оны 2-р сарын 20'
        },
        {
            category: 'Залбирал',
            title: 'Эх орныхоо төлөөх нэгдсэн залбирал үргэлжилж байна',
            excerpt: 'Чуулганууд нэгдэж улс орныхоо хөгжил цэцэглэлт, амар амгалангийн төлөө тасралтгүй залбирсаар байна.',
            image: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80',
            date: '2026 оны 2-р сарын 19'
        },
        {
            category: 'Гэр бүл',
            title: 'Христийн гэр бүлийн харилцааг бэхжүүлэх зөвлөгөөн',
            excerpt: 'Гэр бүл бол Бурханы бүтээсэн ариун баяр баясгалан бөгөөд түүнийг хэрхэн хайраар удирдах тухай.',
            image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
            date: '2026 оны 2-р сарын 18'
        },
        {
            category: 'Номлол',
            title: 'Итгэлийн хүч ба Тэвчээр - Долоо хоногийн онцлох номлол',
            excerpt: 'Хэцүү цаг үед итгэлээ хэрхэн бат зогсоох тухай Гэгээн Библийн ишлэл дээр үндэслэсэн номлол.',
            image: 'https://images.unsplash.com/photo-1445445290250-d8a346a0e2ec?auto=format&fit=crop&w=800&q=80',
            date: '2026 оны 2-р сарын 17'
        }
    ]).select();

    if (error) {
        console.log('❌ Insert error:', error.message);
        console.log('\n👉 You need to create the table first!');
        console.log('Go to: https://supabase.com/dashboard/project/poulcejdgwyzmvjysqew/sql/new');
        console.log('Copy and paste the SQL from supabase-setup.sql and click Run.');
    } else {
        console.log('✅ Seed data inserted! Count:', data.length);
    }

    // Verify
    const { data: allNews, error: readError } = await supabase.from('news').select('*');
    if (!readError && allNews) {
        console.log('\n📊 Total news in database:', allNews.length);
        allNews.forEach(n => console.log(`  - [${n.category}] ${n.title}`));
    }
}

setup();
