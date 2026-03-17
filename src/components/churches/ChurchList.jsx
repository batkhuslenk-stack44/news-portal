import React, { useState, useMemo } from 'react';

function ChurchList({ churches, onSelectChurch, user, onRegisterClick }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('Бүх байршил');

    // Extract unique locations for the dropdown
    const locations = useMemo(() => {
        const uniqueAddresses = new Set(churches.map(c => c.address.trim()));
        return ['Бүх байршил', ...Array.from(uniqueAddresses)];
    }, [churches]);

    const filteredChurches = churches.filter(church => {
        const matchesName = church.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = selectedLocation === 'Бүх байршил' || church.address.trim() === selectedLocation;
        return matchesName && matchesLocation;
    });

    return (
        <section>
            <div className="section-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 className="serif" style={{ margin: 0 }}>Сүм чуулганууд</h2>
                    {user && (
                        <button onClick={onRegisterClick} className="btn btn-primary">
                            ➕ Сүм бүртгүүлэх
                        </button>
                    )}
                </div>
                
                <div className="church-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', background: 'var(--glass-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Сүм хайх..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                        style={{ flex: '1 1 200px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    />
                    <select 
                        value={selectedLocation} 
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="form-control"
                        style={{ flex: '1 1 200px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    >
                        {locations.map(loc => (
                            <option key={loc} value={loc}>📍 {loc}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredChurches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }} className="glass">
                    {searchTerm || selectedLocation !== 'Бүх байршил' ? "Хайлтад тохирох сүм олдсонгүй." : "Одоогоор сүм бүртгэгдээгүй байна."}
                </div>
            ) : (
                <div className="news-grid">
                    {filteredChurches.map(church => (
                        <article key={church.id} className="grid-article church-card" onClick={() => onSelectChurch(church)} style={{ cursor: 'pointer' }}>
                            <img src={church.image_url || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800'} alt={church.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                            <h3 className="serif" style={{ marginTop: '1rem' }}>{church.name}</h3>
                            <p className="article-excerpt">📍 {church.address}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👥 Гишүүдийн тоо: {church.members_count}</p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ChurchList;
