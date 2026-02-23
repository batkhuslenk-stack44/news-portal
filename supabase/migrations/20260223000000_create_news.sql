-- Create the news table
CREATE TABLE IF NOT EXISTS news (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  image TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public access for CRUD
CREATE POLICY "Allow public read" ON news FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON news FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON news FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON news FOR DELETE USING (true);

-- Seed data
INSERT INTO news (category, title, excerpt, image, date) VALUES
('Сүм чуулган', 'Улаанбаатар хотод Христийн мэндэлсний баярын нэгдсэн цуглаан амжилттай боллоо', 'Мянга мянган итгэгчид цуглаж, эв нэгдэл ба хайрын баярыг хамтдаа тэмдэглэн, эх орныхоо төлөө ерөөл өргөв.', 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80', '2026 оны 2-р сарын 22'),
('Библи судлал', 'Шинэ Библи судлалын хөтөлбөр залуучуудад зориулан гарлаа', 'Орчин үеийн залууст зориулсан Библийн сургааль ба амьдралын практик хөтөлбөр цахим хэлбэрээр хүрч эхлэв.', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80', '2026 оны 2-р сарын 21'),
('Гэрчлэл', 'Итгэл сэтгэл: Амьдралын хүнд давааг Бурханы тусламжтай хэрхэн давсан бэ?', 'Нэгэн итгэгч ахын маань амьдралд тохиолдсон гайхамшигт өөрчлөлт ба Бурханы хайрын тухай түүх.', 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80', '2026 оны 2-р сарын 20'),
('Залбирал', 'Эх орныхоо төлөөх нэгдсэн залбирал үргэлжилж байна', 'Чуулганууд нэгдэж улс орныхоо хөгжил цэцэглэлт, амар амгалангийн төлөө тасралтгүй залбирсаар байна.', 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80', '2026 оны 2-р сарын 19'),
('Гэр бүл', 'Христийн гэр бүлийн харилцааг бэхжүүлэх зөвлөгөөн', 'Гэр бүл бол Бурханы бүтээсэн ариун баяр баясгалан бөгөөд түүнийг хэрхэн хайраар удирдах тухай.', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', '2026 оны 2-р сарын 18'),
('Номлол', 'Итгэлийн хүч ба Тэвчээр - Долоо хоногийн онцлох номлол', 'Хэцүү цаг үед итгэлээ хэрхэн бат зогсоох тухай Гэгээн Библийн ишлэл дээр үндэслэсэн номлол.', 'https://images.unsplash.com/photo-1445445290250-d8a346a0e2ec?auto=format&fit=crop&w=800&q=80', '2026 оны 2-р сарын 17');
