import React from 'react';

function ChurchNewsList({ news }) {
    const renderContent = (content) => {
        if (!content) return null;
        const parts = content.split('YT_LINK:');
        const textContent = parts[0].trim();
        const youtubeUrl = parts[1] ? parts[1].trim() : null;

        let embedUrl = null;
        if (youtubeUrl) {
            let videoId = '';
            if (youtubeUrl.includes('youtu.be/')) {
                videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
            } else if (youtubeUrl.includes('youtube.com/watch')) {
                try {
                    videoId = new URLSearchParams(youtubeUrl.split('?')[1]).get('v');
                } catch (e) {
                    // Ignore parsing error
                }
            } else if (youtubeUrl.includes('youtube.com/embed/')) {
                videoId = youtubeUrl.split('youtube.com/embed/')[1].split('?')[0];
            }
            
            if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        }

        return (
            <>
                <p style={{ whiteSpace: 'pre-wrap' }}>{textContent}</p>
                {embedUrl && (
                    <div style={{ marginTop: '1rem', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                        <iframe 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            src={embedUrl} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowFullScreen>
                        </iframe>
                    </div>
                )}
            </>
        );
    };

    return (
        <section className="church-news-section">
            <h3 className="serif" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Цугларалтын мэдээлэл, хөтөлбөр</h3>
            <div className="news-list">
                {!news || news.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Одоогоор мэдээ оруулаагүй байна.</p>
                ) : (
                    news.map(item => (
                        <article key={item.id} className="small-article glass" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                            <h4>{item.title}</h4>
                            {renderContent(item.content)}
                            <span className="date-bar" style={{ border: 'none', padding: 0, marginTop: '1rem' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}

export default ChurchNewsList;
