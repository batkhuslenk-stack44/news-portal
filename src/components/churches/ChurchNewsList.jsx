import React from 'react';

function ChurchNewsList({ news }) {
    return (
        <section className="church-news-section">
            <h3 className="serif" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Чуулганы мэдээлэл</h3>
            <div className="news-list">
                {!news || news.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Одоогоор мэдээ оруулаагүй байна.</p>
                ) : (
                    news.map(item => (
                        <article key={item.id} className="small-article glass" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                            <h4>{item.title}</h4>
                            <p>{item.content}</p>
                            <span className="date-bar" style={{ border: 'none', padding: 0, marginTop: '1rem' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}

export default ChurchNewsList;
