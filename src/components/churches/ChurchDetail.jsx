import React from 'react';
import ChurchNewsList from './ChurchNewsList';

function ChurchDetail({ church, churchNews, user, onBack, onEditClick, onAddNewsClick }) {
    return (
        <section className="church-detail">
            <button onClick={onBack} className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }}>← Буцах</button>
            <div className="church-hero glass" style={{ padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <img src={church.image_url || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800'} alt={church.name} style={{ width: '400px', height: '300px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                        <h2 className="serif" style={{ fontSize: '2.5rem' }}>{church.name}</h2>
                        <p style={{ margin: '1rem 0', fontSize: '1.1rem' }}>{church.description}</p>
                        <p><strong>📍 Хаяг:</strong> {church.address}</p>
                        <p><strong>👥 Гишүүдийн тоо:</strong> {church.members_count}</p>
                        <p><strong>✨ Үйл ажиллагаа:</strong> {church.activities}</p>
                        {church.location_url && (
                            <a href={church.location_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>Байршил харах (Google Maps)</a>
                        )}
                        {user && user.id === church.owner_id && (
                            <div style={{ marginTop: '2rem' }}>
                                <button onClick={() => onEditClick(church)} className="btn btn-sm btn-primary">Засах</button>
                                <button onClick={onAddNewsClick} className="btn btn-sm btn-secondary" style={{ marginLeft: '0.5rem' }}>Мэдээ нэмэх</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ChurchNewsList news={churchNews} />
        </section>
    );
}

export default ChurchDetail;
