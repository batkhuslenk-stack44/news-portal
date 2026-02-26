import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabase';

function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const currentDate = new Date().toLocaleDateString('mn-MN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    fetchNews();
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchProfile(user.id);
    }
  }

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    setProfile(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function fetchNews() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Мэдээ ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Алдаа гарлаа</h2>
          <p>{error}</p>
          <button onClick={fetchNews} className="btn btn-primary">Дахин оролдох</button>
        </div>
      </div>
    );
  }

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
              <li><Link to="/testimonies">Гэрчлэл</Link></li>
              <li><a href="#">Залбирал</a></li>
              <li><a href="#">Гэр бүл</a></li>
              <li><a href="#">Номлол</a></li>
              <li><Link to="/admin" className="admin-link">Админ</Link></li>
              {user ? (
                <>
                  <li className="user-nav-item">
                    <span className="user-avatar-small">{(profile?.username || 'U').charAt(0).toUpperCase()}</span>
                    <span className="user-name-nav">{profile?.username || 'User'}</span>
                  </li>
                  <li><button onClick={handleLogout} className="btn btn-sm btn-secondary nav-logout-btn">Гарах</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="btn btn-sm btn-primary">🔑 Нэвтрэх</Link></li>
                  <li><Link to="/register" className="btn btn-sm btn-secondary">📝 Бүртгүүлэх</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="container">
        {news.length === 0 ? (
          <div className="empty-state">
            <h2>Мэдээ байхгүй байна</h2>
            <p>Админ хуудаснаас шинэ мэдээ нэмнэ үү.</p>
            <Link to="/admin" className="btn btn-primary">Админ хуудас руу очих</Link>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="hero-grid">
              <article className="main-article">
                <span className="article-category">{news[0].category}</span>
                <Link to={`/article/${news[0].id}`}>
                  <img src={news[0].image} alt="Hero" className="hero-img" />
                </Link>
                <Link to={`/article/${news[0].id}`} className="article-link">
                  <h2 className="article-title">{news[0].title}</h2>
                </Link>
                <p className="article-excerpt">{news[0].excerpt}</p>
              </article>

              <aside className="side-articles">
                <h2 className="serif" style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Сүүлийн мэдээ</h2>
                {news.slice(1, 4).map(item => (
                  <div key={item.id} className="small-article">
                    <span className="article-category">{item.category}</span>
                    <Link to={`/article/${item.id}`} className="article-link">
                      <h3>{item.title}</h3>
                    </Link>
                    <span className="date-bar" style={{ border: 'none', padding: 0 }}>{item.date}</span>
                  </div>
                ))}
              </aside>
            </section>

            {/* Categories Bar */}
            <h2 className="serif" style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', borderTop: '4px double var(--border-color)', paddingTop: '2rem' }}>Онцлох сэдвүүд</h2>

            {/* News Grid */}
            <section className="news-grid">
              {news.map(item => (
                <article key={item.id} className="grid-article">
                  <span className="article-category">{item.category}</span>
                  <Link to={`/article/${item.id}`} className="article-link">
                    <h3 style={{ marginBottom: '1rem' }}>{item.title}</h3>
                  </Link>
                  <p className="article-excerpt" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{item.excerpt}</p>
                  <div className="date-bar" style={{ border: 'none', padding: 0, fontSize: '0.7rem' }}>
                    <span>{item.date}</span>
                    <Link to={`/article/${item.id}`} style={{ fontWeight: 700 }}>Дэлгэрэнгүй →</Link>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
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
            <li><Link to="/admin">Админ нэвтрэх</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;
