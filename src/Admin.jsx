import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabase';

const ADMIN_PASSWORD = 'itgel2026';

function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        category: '',
        title: '',
        excerpt: '',
        image: '',
        date: ''
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchNews();
        }
    }, [isAuthenticated]);

    async function fetchNews() {
        setLoading(true);
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            showMessage('Мэдээ татахад алдаа: ' + error.message, 'error');
        } else {
            setNews(data || []);
        }
        setLoading(false);
    }

    function showMessage(text, type = 'success') {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }

    function handleLogin(e) {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            showMessage('Нууц үг буруу байна!', 'error');
        }
    }

    function resetForm() {
        setForm({ category: '', title: '', excerpt: '', image: '', date: '' });
        setEditingId(null);
    }

    function startEdit(item) {
        setEditingId(item.id);
        setForm({
            category: item.category,
            title: item.title,
            excerpt: item.excerpt,
            image: item.image,
            date: item.date
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== Image Upload =====
    async function handleImageUpload(file) {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('Зөвхөн JPG, PNG, GIF, WEBP зураг оруулна уу!', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage('Зурагны хэмжээ 5MB-аас бага байх ёстой!', 'error');
            return;
        }

        setUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('news-images')
            .upload(fileName, file);

        if (error) {
            showMessage('Зураг upload хийхэд алдаа: ' + error.message, 'error');
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('news-images')
            .getPublicUrl(fileName);

        setForm({ ...form, image: publicUrl });
        showMessage('Зураг амжилттай upload хийгдлээ! 📸');
        setUploading(false);
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        handleImageUpload(file);
    }

    function handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!form.category || !form.title || !form.excerpt || !form.image || !form.date) {
            showMessage('Бүх талбарыг бөглөнө үү!', 'error');
            return;
        }

        setLoading(true);

        if (editingId) {
            const { error } = await supabase
                .from('news')
                .update({
                    category: form.category,
                    title: form.title,
                    excerpt: form.excerpt,
                    image: form.image,
                    date: form.date
                })
                .eq('id', editingId);

            if (error) {
                showMessage('Засахад алдаа: ' + error.message, 'error');
            } else {
                showMessage('Мэдээ амжилттай засагдлаа! ✅');
                resetForm();
                fetchNews();
            }
        } else {
            const { error } = await supabase
                .from('news')
                .insert([{
                    category: form.category,
                    title: form.title,
                    excerpt: form.excerpt,
                    image: form.image,
                    date: form.date
                }]);

            if (error) {
                showMessage('Нэмэхэд алдаа: ' + error.message, 'error');
            } else {
                showMessage('Мэдээ амжилттай нэмэгдлээ! ✅');
                resetForm();
                fetchNews();
            }
        }

        setLoading(false);
    }

    async function handleDelete(id) {
        if (!window.confirm('Энэ мэдээг устгах уу?')) return;

        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

        if (error) {
            showMessage('Устгахад алдаа: ' + error.message, 'error');
        } else {
            showMessage('Мэдээ устгагдлаа! 🗑️');
            fetchNews();
        }
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="app">
                <div className="admin-login">
                    <div className="login-card">
                        <h1 className="serif">🔐 Админ нэвтрэх</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Мэдээ удирдахын тулд нууц үгээ оруулна уу
                        </p>
                        <form onSubmit={handleLogin}>
                            <input
                                type="password"
                                placeholder="Нууц үг"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="form-input"
                                autoFocus
                            />
                            <button type="submit" className="btn btn-primary btn-full">Нэвтрэх</button>
                        </form>
                        {message.text && (
                            <div className={`message message-${message.type}`}>{message.text}</div>
                        )}
                        <Link to="/" className="back-link">← Нүүр хуудас руу буцах</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="app">
            <div className="admin-container">
                <header className="admin-header">
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 className="serif" style={{ fontSize: '1.8rem' }}>📰 Мэдээ удирдах</h1>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/" className="btn btn-secondary">🏠 Нүүр хуудас</Link>
                            <button onClick={() => setIsAuthenticated(false)} className="btn btn-danger">Гарах</button>
                        </div>
                    </div>
                </header>

                {message.text && (
                    <div className={`message message-${message.type}`}>{message.text}</div>
                )}

                {/* Form */}
                <div className="container" style={{ marginTop: '2rem' }}>
                    <div className="admin-form-card">
                        <h2 className="serif" style={{ marginBottom: '1.5rem' }}>
                            {editingId ? '✏️ Мэдээ засах' : '➕ Шинэ мэдээ нэмэх'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Ангилал</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="form-input"
                                    >
                                        <option value="">Ангилал сонгох...</option>
                                        <option value="Сүм чуулган">Сүм чуулган</option>
                                        <option value="Библи судлал">Библи судлал</option>
                                        <option value="Гэрчлэл">Гэрчлэл</option>
                                        <option value="Залбирал">Залбирал</option>
                                        <option value="Гэр бүл">Гэр бүл</option>
                                        <option value="Номлол">Номлол</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Огноо</label>
                                    <input
                                        type="text"
                                        placeholder="жишээ нь: 2026 оны 2-р сарын 23"
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Гарчиг</label>
                                <input
                                    type="text"
                                    placeholder="Мэдээний гарчиг..."
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Товч агуулга</label>
                                <textarea
                                    placeholder="Мэдээний товч агуулга..."
                                    value={form.excerpt}
                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                    className="form-input form-textarea"
                                    rows={3}
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div className="form-group">
                                <label>Зураг</label>
                                <div className="image-mode-toggle">
                                    <button
                                        type="button"
                                        className={`toggle-btn ${imageMode === 'upload' ? 'active' : ''}`}
                                        onClick={() => setImageMode('upload')}
                                    >
                                        📤 Upload хийх
                                    </button>
                                    <button
                                        type="button"
                                        className={`toggle-btn ${imageMode === 'url' ? 'active' : ''}`}
                                        onClick={() => setImageMode('url')}
                                    >
                                        🔗 URL оруулах
                                    </button>
                                </div>

                                {imageMode === 'upload' ? (
                                    <div
                                        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        {uploading ? (
                                            <div className="upload-progress">
                                                <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                                                <p>Зураг upload хийж байна...</p>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <span className="upload-icon">📁</span>
                                                <p>Зураг чирж оруулах эсвэл дарж сонгох</p>
                                                <span className="upload-hint">JPG, PNG, GIF, WEBP • 5MB хүртэл</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/..."
                                        value={form.image}
                                        onChange={e => setForm({ ...form, image: e.target.value })}
                                        className="form-input"
                                    />
                                )}
                            </div>

                            {form.image && (
                                <div className="image-preview">
                                    <img src={form.image} alt="Preview" />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => setForm({ ...form, image: '' })}
                                    >
                                        ✕ Зураг хасах
                                    </button>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Хадгалж байна...' : editingId ? '💾 Хадгалах' : '➕ Нэмэх'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={resetForm} className="btn btn-secondary">Цуцлах</button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* News List */}
                    <h2 className="serif" style={{ margin: '2rem 0 1rem', fontSize: '1.5rem' }}>
                        📋 Бүх мэдээ ({news.length})
                    </h2>

                    {loading && news.length === 0 ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="empty-state">
                            <p>Мэдээ байхгүй байна. Дээрх формоор шинэ мэдээ нэмнэ үү.</p>
                        </div>
                    ) : (
                        <div className="admin-news-list">
                            {news.map(item => (
                                <div key={item.id} className="admin-news-item">
                                    <div className="admin-news-info">
                                        <span className="article-category">{item.category}</span>
                                        <h3>{item.title}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.excerpt}</p>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.date}</span>
                                    </div>
                                    <div className="admin-news-actions">
                                        <button onClick={() => startEdit(item)} className="btn btn-secondary btn-sm">✏️ Засах</button>
                                        <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">🗑️ Устгах</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Admin;
