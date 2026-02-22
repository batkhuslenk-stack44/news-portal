import React from 'react';

const SAMPLE_NEWS = [
  {
    id: 1,
    category: "Politics",
    title: "Global Summit Reaches Historic Agreement on Climate Action",
    excerpt: "World leaders gathered in London have finalized a comprehensive plan to reduce carbon emissions by 60% within the next decade.",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    date: "Feb 22, 2026"
  },
  {
    id: 2,
    category: "Business",
    title: "Tech Giants Announce Merger, Reshaping the Digital Landscape",
    excerpt: "Two of the world's leading technology firms have officially merged in a deal valued at over $300 billion.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    date: "Feb 21, 2026"
  },
  {
    id: 3,
    category: "Technology",
    title: "AI Breakthrough: First Neural Network to Pass Unified Bar Exam",
    excerpt: "Researchers have unveiled a new AI model that successfully completed one of the most difficult legal exams without specialized training.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    date: "Feb 20, 2026"
  },
  {
    id: 4,
    category: "Lifestyle",
    title: "The Rise of Urban Farming: Cities Green Up for Sustainability",
    excerpt: "From rooftops to abandoned warehouses, urban agriculture is transforming the way city dwellers source their fresh produce.",
    image: "https://images.unsplash.com/photo-1530836361280-88b2ad03027a?auto=format&fit=crop&w=800&q=80",
    date: "Feb 19, 2026"
  },
  {
    id: 5,
    category: "Science",
    title: "New Telescope Reveals Deepest Look Into Nebula Origins",
    excerpt: "NASA's latest orbital observatory has captured stunning images of star formation in the Orion Nebula.",
    image: "https://images.unsplash.com/photo-1464802686167-b939a67e052c?auto=format&fit=crop&w=800&q=80",
    date: "Feb 18, 2026"
  },
  {
    id: 6,
    category: "World",
    title: "Antarctic Ice Shelf Shows Surprising Signs of Stability",
    excerpt: "New data from satellite imaging suggests certain regions of the Antarctic ice sheet are more resilient than previously thought.",
    image: "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=800&q=80",
    date: "Feb 17, 2026"
  }
];

function App() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="app">
      <header>
        <div className="container">
          <h1 className="site-title">The Daily Planet</h1>
          <div className="date-bar">
            <span>{currentDate}</span>
            <span>Vol. LXXIV — No. 256</span>
            <span>New York, NY</span>
          </div>
          <nav>
            <ul className="nav-links">
              <li><a href="#">World</a></li>
              <li><a href="#">Politics</a></li>
              <li><a href="#">Business</a></li>
              <li><a href="#">Tech</a></li>
              <li><a href="#">Science</a></li>
              <li><a href="#">Lifestyle</a></li>
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
            <h2 className="serif" style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Latest Updates</h2>
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
        <h2 className="serif" style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', borderTop: '4px double var(--border-color)', paddingTop: '2rem' }}>Featured Stories</h2>

        {/* News Grid */}
        <section className="news-grid">
          {SAMPLE_NEWS.map(news => (
            <article key={news.id} className="grid-article">
              <span className="article-category">{news.category}</span>
              <h3 style={{ marginBottom: '1rem' }}>{news.title}</h3>
              <p className="article-excerpt" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{news.excerpt}</p>
              <div className="date-bar" style={{ border: 'none', padding: 0, fontSize: '0.7rem' }}>
                <span>{news.date}</span>
                <a href="#" style={{ fontWeight: 700 }}>Read More →</a>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer>
        <div className="container">
          <h2 className="site-title" style={{ fontSize: '2rem' }}>The Daily Planet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>© 2026 News Media Group. All rights reserved.</p>
          <ul className="nav-links" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Advertise</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;
