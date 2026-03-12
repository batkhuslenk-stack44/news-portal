import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import { Link } from 'react-router-dom';
import { uploadToCloudinary } from './lib/cloudinary';

function Churches() {
    const [churches, setChurches] = useState([]);
    const [selectedChurch, setSelectedChurch] = useState(null);
    const [churchNews, setChurchNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showRegForm, setShowRegForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newsForm, setNewsForm] = useState({ title: '', content: '' });
    const [showNewsForm, setShowNewsForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        members_count: 0,
        activities: '',
        address: '',
        location_url: '',
        image_url: ''
    });

    useEffect(() => {
        fetchChurches();
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            fetchProfile(user.id);
        }
    }

    async function fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', userId)
                .single();
            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err.message);
        }
    }

    async function fetchChurches() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('churches')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setChurches(data || []);
        } catch (err) {
            console.error('Error fetching churches:', err.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchChurchNews(churchId) {
        try {
            const { data, error } = await supabase
                .from('church_news')
                .select('*')
                .eq('church_id', churchId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setChurchNews(data || []);
        } catch (err) {
            console.error('Error fetching news:', err.message);
        }
    }

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const result = await uploadToCloudinary(file, 'image');
            setFormData(prev => ({ ...prev, image_url: result.url }));
            alert('Зураг амжилттай хуулагдлаа! 📸');
        } catch (error) {
            alert('Зураг хуулахад алдаа: ' + error.message);
        } finally {
            setUploading(false);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('churches')
                .insert([{ ...formData, owner_id: user.id }])
                .select();
            if (error) throw error;
            setChurches([data[0], ...churches]);
            setShowRegForm(false);
            setFormData({
                name: '', description: '', members_count: 0, activities: '',
                address: '', location_url: '', image_url: ''
            });
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('churches')
                .update(formData)
                .eq('id', selectedChurch.id)
                .select();
            if (error) throw error;
            setChurches(churches.map(c => c.id === selectedChurch.id ? data[0] : c));
            setSelectedChurch(data[0]);
            setIsEditing(false);
        } catch (err) {
            alert(err.message);
        }
    }

    async function handlePostNews(e) {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('church_news')
                .insert([{ ...newsForm, church_id: selectedChurch.id }])
                .select();
            if (error) throw error;
            setChurchNews([data[0], ...churchNews]);
            setShowNewsForm(false);
            setNewsForm({ title: '', content: '' });
        } catch (err) {
            alert(err.message);
        }
    }

    const handleSelectChurch = (church) => {
        setSelectedChurch(church);
        fetchChurchNews(church.id);
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

    return (
        <div className="app">
            <Header
                user={user}
                profile={profile}
                handleLogout={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    setProfile(null);
                }}
                dateBarInfo={
                    <>
                        <span>💒 Сүм чуулган</span>
                    </>
                }
            />

            <main className="container">
                {!selectedChurch && !showRegForm ? (
                    <section>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 className="serif">Сүм чуулганууд</h2>
                            {user && (
                                <button onClick={() => setShowRegForm(true)} className="btn btn-primary">
                                    ➕ Сүм бүртгүүлэх
                                </button>
                            )}
                        </div>

                        <div className="news-grid">
                            {churches.map(church => (
                                <article key={church.id} className="grid-article church-card" onClick={() => handleSelectChurch(church)} style={{ cursor: 'pointer' }}>
                                    <img src={church.image_url || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800'} alt={church.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <h3 className="serif" style={{ marginTop: '1rem' }}>{church.name}</h3>
                                    <p className="article-excerpt">{church.address}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Гишүүдийн тоо: {church.members_count}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : showRegForm ? (
                    <section className="admin-form-container glass">
                        <h2 className="serif">Сүм бүртгүүлэх</h2>
                        <form onSubmit={handleRegister} className="admin-form">
                            <div className="form-group">
                                <label>Чуулганы нэр</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Танилцуулга</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Гишүүдийн тоо</label>
                                    <input type="number" value={formData.members_count} onChange={e => setFormData({ ...formData, members_count: parseInt(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label>Хаяг</label>
                                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Үйл ажиллагаа (Таслалаар тусгаарлах)</label>
                                <input type="text" value={formData.activities} onChange={e => setFormData({ ...formData, activities: e.target.value })} placeholder="Залбирал, Хүүхдийн хичээл..." required />
                            </div>
                            <div className="form-group">
                                <label>Google Maps URL</label>
                                <input type="url" value={formData.location_url} onChange={e => setFormData({ ...formData, location_url: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Зургийн URL</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input type="url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} style={{ flex: 1 }} />
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                                    <button type="button" className="btn btn-sm btn-outline" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                                        {uploading ? '...' : '📸 Сонгох'}
                                    </button>
                                </div>
                            </div>
                            <div className="btn-group">
                                <button type="submit" className="btn btn-primary">Бүртгүүлэх</button>
                                <button type="button" onClick={() => setShowRegForm(false)} className="btn btn-secondary">Цуцлах</button>
                            </div>
                        </form>
                    </section>
                ) : (
                    <section className="church-detail">
                        <button onClick={() => setSelectedChurch(null)} className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }}>← Буцах</button>
                        <div className="church-hero glass" style={{ padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                <img src={selectedChurch.image_url || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800'} alt={selectedChurch.name} style={{ width: '400px', height: '300px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ flex: 1 }}>
                                    <h2 className="serif" style={{ fontSize: '2.5rem' }}>{selectedChurch.name}</h2>
                                    <p style={{ margin: '1rem 0', fontSize: '1.1rem' }}>{selectedChurch.description}</p>
                                    <p><strong>📍 Хаяг:</strong> {selectedChurch.address}</p>
                                    <p><strong>👥 Гишүүдийн тоо:</strong> {selectedChurch.members_count}</p>
                                    <p><strong>✨ Үйл ажиллагаа:</strong> {selectedChurch.activities}</p>
                                    {selectedChurch.location_url && (
                                        <a href={selectedChurch.location_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>Байршил харах (Google Maps)</a>
                                    )}
                                    {user && user.id === selectedChurch.owner_id && (
                                        <div style={{ marginTop: '2rem' }}>
                                            <button onClick={() => { setIsEditing(true); setFormData(selectedChurch); }} className="btn btn-sm btn-primary">Засах</button>
                                            <button onClick={() => setShowNewsForm(true)} className="btn btn-sm btn-secondary" style={{ marginLeft: '0.5rem' }}>Мэдээ нэмэх</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="modal-overlay">
                                <div className="modal-content glass">
                                    <h3>Мэдээлэл засах</h3>
                                    <form onSubmit={handleUpdate} className="admin-form">
                                        <div className="form-group">
                                            <label>Чуулганы нэр</label>
                                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        {/* Reuse same fields as registration */}
                                        <div className="form-group">
                                            <label>Танилцуулга</label>
                                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                                        </div>
                                        <div className="btn-group">
                                            <button type="submit" className="btn btn-primary">Хадгалах</button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Цуцлах</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {showNewsForm && (
                            <div className="modal-overlay">
                                <div className="modal-content glass">
                                    <h3>Шинэ мэдээ оруулах</h3>
                                    <form onSubmit={handlePostNews} className="admin-form">
                                        <div className="form-group">
                                            <label>Гарчиг</label>
                                            <input type="text" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Агуулга</label>
                                            <textarea value={newsForm.content} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} required />
                                        </div>
                                        <div className="btn-group">
                                            <button type="submit" className="btn btn-primary">Нийтлэх</button>
                                            <button type="button" onClick={() => setShowNewsForm(false)} className="btn btn-secondary">Цуцлах</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <section className="church-news-section">
                            <h3 className="serif" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Чуулганы мэдээлэл</h3>
                            <div className="news-list">
                                {churchNews.length === 0 ? (
                                    <p>Одоогоор мэдээ оруулаагүй байна.</p>
                                ) : (
                                    churchNews.map(news => (
                                        <article key={news.id} className="small-article glass" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                                            <h4>{news.title}</h4>
                                            <p>{news.content}</p>
                                            <span className="date-bar" style={{ border: 'none', padding: 0, marginTop: '1rem' }}>{new Date(news.created_at).toLocaleDateString()}</span>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>
                    </section>
                )}
            </main>

            <footer>
                <div className="container">
                    <p>© 2026 FAITH NEWS. Сүм чуулганы нэгдсэн мэдээллийн сан.</p>
                </div>
            </footer>
        </div>
    );
}

export default Churches;
