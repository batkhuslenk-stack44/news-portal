import React from 'react';

const SAMPLE_NEWS = [
  {
    id: 1,
    category: "Сүм чуулган",
    title: "Улаанбаатар хотод Христийн мэндэлсний баярын нэгдсэн цуглаан амжилттай боллоо",
    excerpt: "Мянга мянган итгэгчид цуглаж, эв нэгдэл ба хайрын баярыг хамтдаа тэмдэглэн, эх орныхоо төлөө ерөөл өргөв.",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    date: "2026 оны 2-р сарын 22"
  },
  {
    id: 2,
    category: "Библи судлал",
    title: "Шинэ Библи судлалын хөтөлбөр залуучуудад зориулан гарлаа",
    excerpt: "Орчин үеийн залууст зориулсан Библийн сургааль ба амьдралын практик хөтөлбөр цахим хэлбэрээр хүрч эхлэв.",
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80",
    date: "2026 оны 2-р сарын 21"
  },
  {
    id: 3,
    category: "Гэрчлэл",
    title: "Итгэл сэтгэл: Амьдралын хүнд давааг Бурханы тусламжтай хэрхэн давсан бэ?",
    excerpt: "Нэгэн итгэгч ахын маань амьдралд тохиолдсон гайхамшигт өөрчлөлт ба Бурханы хайрын тухай түүх.",
    image: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80",
    date: "2026 оны 2-р сарын 20"
  },
  {
    id: 4,
    category: "Залбирал",
    title: "Эх орныхоо төлөөх нэгдсэн залбирал үргэлжилж байна",
    excerpt: "Чуулганууд нэгдэж улс орныхоо хөгжил цэцэглэлт, амар амгалангийн төлөө тасралтгүй залбирсаар байна.",
    image: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80",
    date: "2026 оны 2-р сарын 19"
  },
  {
    id: 5,
    category: "Гэр бүл",
    title: "Христийн гэр бүлийн харилцааг бэхжүүлэх зөвлөгөөн",
    excerpt: "Гэр бүл бол Бурханы бүтээсэн ариун баяр баясгалан бөгөөд түүнийг хэрхэн хайраар удирдах тухай.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
    date: "2026 оны 2-р сарын 18"
  },
  {
    id: 6,
    category: "Номлол",
    title: "Итгэлийн хүч ба Тэвчээр - Долоо хоногийн онцлох номлол",
    excerpt: "Хэцүү цаг үед итгэлээ хэрхэн бат зогсоох тухай Гэгээн Библийн ишлэл дээр үндэслэсэн номлол.",
    image: "https://images.unsplash.com/photo-1445445290250-d8a346a0e2ec?auto=format&fit=crop&w=800&q=80",
    date: "2026 оны 2-р сарын 17"
  }
];

function App() {
  const currentDate = new Date().toLocaleDateString('mn-MN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="app">
      <header>
        <div className="container">
          <h1 className="site-title">ИТГЭЛИЙН ЗАМ</h1>
          <div className="date-bar">
            <span>{currentDate}</span>
            <span>Хувилбар LXXIV — Дугаар 256</span>
            <span>Монгол Улс, Улаанбаатар</span>
          </div>
          <nav>
            <ul className="nav-links">
              <li><a href="#">Сүм чуулган</a></li>
              <li><a href="#">Библи судлал</a></li>
              <li><a href="#">Гэрчлэл</a></li>
              <li><a href="#">Залбирал</a></li>
              <li><a href="#">Гэр бүл</a></li>
              <li><a href="#">Номлол</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container">
        {/* Hero Section */}
        <section className="hero-grid">
          <article className="main-article">
            <span className="article-category">{SAMPLE_NEWS[0].category}</span>
            <img src={SAMPLE_NEWS[0].image} alt="Hero" className="hero-img" />
            <h2 className="article-title">{SAMPLE_NEWS[0].title}</h2>
            <p className="article-excerpt">{SAMPLE_NEWS[0].excerpt}</p>
          </article>

          <aside className="side-articles">
            <h2 className="serif" style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Сүүлийн мэдээ</h2>
            {SAMPLE_NEWS.slice(1, 4).map(news => (
              <div key={news.id} className="small-article">
                <span className="article-category">{news.category}</span>
                <h3>{news.title}</h3>
                <span className="date-bar" style={{ border: 'none', padding: 0 }}>{news.date}</span>
              </div>
            ))}
          </aside>
        </section>

        {/* Categories Bar */}
        <h2 className="serif" style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', borderTop: '4px double var(--border-color)', paddingTop: '2rem' }}>Онцлох сэдвүүд</h2>

        {/* News Grid */}
        <section className="news-grid">
          {SAMPLE_NEWS.map(news => (
            <article key={news.id} className="grid-article">
              <span className="article-category">{news.category}</span>
              <h3 style={{ marginBottom: '1rem' }}>{news.title}</h3>
              <p className="article-excerpt" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{news.excerpt}</p>
              <div className="date-bar" style={{ border: 'none', padding: 0, fontSize: '0.7rem' }}>
                <span>{news.date}</span>
                <a href="#" style={{ fontWeight: 700 }}>Дэлгэрэнгүй →</a>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer>
        <div className="container">
          <h2 className="site-title" style={{ fontSize: '2rem' }}>ИТГЭЛИЙН ЗАМ</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>© 2026 Христийн Мэдээ Төв. Бүх эрх хуулиар хамгаалагдсан.</p>
          <ul className="nav-links" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <li><a href="#">Нууцлалын бодлого</a></li>
            <li><a href="#">Үйлчилгээний нөхцөл</a></li>
            <li><a href="#">Холбоо барих</a></li>
            <li><a href="#">Бидний тухай</a></li>
            <li><a href="#">Зар сурталчилгаа</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;
