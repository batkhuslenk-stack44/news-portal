import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { uploadToCloudinary } from './lib/cloudinary';
import { usePlayer } from './context/PlayerContext';
import Header from './components/Header';

function Audiobooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Бүгд');
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [expandedBook, setExpandedBook] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const [form, setForm] = useState({
        title: '',
        author: '',
        category: 'Библи',
        description: '',
        audio_url: '',
        link_url: '',
        cover_image: '',
    });

    const categories = ['Бүгд', 'Библи', 'Номлол', 'Гэрчлэл', 'Сургаал', 'Залбирал'];

    useEffect(() => {
        fetchBooks();
        checkAuth();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            if (session?.user) fetchProfile(session.user.id);
            else setProfile(null);
        });
        return () => subscription.unsubscribe();
    }, []);

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) fetchProfile(user.id);
    }

    async function fetchProfile(userId) {
        const { data } = await supabase.from('profiles').select('username').eq('id', userId).single();
        setProfile(data);
    }

    async function fetchBooks() {
        setLoading(true);
        const { data, error } = await supabase
            .from('audiobooks')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setBooks(data);
        }
        setLoading(false);
    }

    // ===== Playback =====
    function playBook(book) {
        playTrack(book, books);
    }

    function formatTime(sec) {
        if (!sec || isNaN(sec)) return '0:00';
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function getFiltered() {
        if (activeCategory === 'Бүгд') return books;
        return books.filter(b => b.category === activeCategory);
    }

    // ===== Upload =====
    function showMsg(text, type = 'success') {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }

    async function handleFileUpload(file) {
        if (!file) return;
        const allowed = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/wav', 'video/mp4'];
        if (!allowed.includes(file.type)) {
            showMsg('Зөвхөн MP3, MP4, WAV файл оруулна уу!', 'error'); return;
        }
        if (file.size > 200 * 1024 * 1024) {
            showMsg('Файлын хэмжээ 200MB-аас бага байх ёстой!', 'error'); return;
        }
        try {
            const result = await uploadToCloudinary(file, 'auto');
            setForm({ ...form, audio_url: result.url });
            showMsg('Файл амжилттай хуулагдлаа! ☁️');
        } catch (error) {
            showMsg('Файл хуулахад алдаа: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    }

    function handleDrag(e) {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }

    function handleDrop(e) {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.title.trim()) { showMsg('Номын нэр оруулна уу!', 'error'); return; }
        if (!form.audio_url && !form.link_url) { showMsg('Аудио файл эсвэл линк оруулна уу!', 'error'); return; }

        setUploading(true);
        const bookData = {
            title: form.title.trim(),
            author: form.author.trim() || (profile?.username || 'Unknown'),
            category: form.category,
            description: form.description.trim() || null,
            audio_url: form.audio_url || form.link_url,
            link_url: form.link_url || null,
            cover_image: form.cover_image || null,
            user_id: user.id,
        };

        const { error } = await supabase.from('audiobooks').insert([bookData]);
        if (error) {
            showMsg('Алдаа: ' + error.message, 'error');
        } else {
            showMsg('Ном амжилттай нэмэгдлээ! 📚');
            setForm({ title: '', author: '', category: 'Библи', description: '', audio_url: '', link_url: '', cover_image: '' });
            setShowForm(false);
            fetchBooks();
        }
        setUploading(false);
    }

    async function handleDelete(bookId) {
        if (!window.confirm('Энэ номыг устгах уу?')) return;
        await supabase.from('audiobooks').delete().eq('id', bookId);
        fetchBooks();
    }

    const filtered = getFiltered();

    if (loading) {
        return (
            <div className="app">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Ном ачааллаж байна...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app">

            <Header
                user={user}
                profile={profile}
                dateBarInfo={
                    <>
                        <span>📚 Сонсдог Ном</span>
                        <span>{books.length} ном</span>
                        {currentTrack && (
                            <span className="now-playing-badge">
                                🎧 Одоо сонсож байна: {currentTrack.title}
                            </span>
                        )}
                    </>
                }
            />

            <main className="container">
                {/* Hero */}
                <div className="audiobook-hero">
                    <h1 className="serif audiobook-hero-title">📚 Сонсдог Ном</h1>
                    <p className="audiobook-hero-subtitle">Бурханы үгийг сонсож, итгэлээ бэхжүүлэе</p>
                    {isAdmin ? (
                        <button className="btn btn-primary" style={{ marginTop: '1.2rem' }}
                            onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕ Хаах' : '➕ Ном нэмэх'}
                        </button>
                    ) : !user ? (
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Ном нэмэхийн тулд <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>нэвтэрнэ үү</Link>
                        </p>
                    ) : null}
                </div>

                {/* Upload Form */}
                {showForm && user && (
                    <div className="audiobook-form">
                        <h2 className="serif" style={{ marginBottom: '1.2rem', fontSize: '1.5rem' }}>📖 Шинэ ном нэмэх</h2>
                        {message.text && <div className={`message message-${message.type}`}>{message.text}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>📖 Номын нэр *</label>
                                    <input type="text" placeholder="Жишээ: Библийн түүхүүд" value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>✍️ Зохиогч</label>
                                    <input type="text" placeholder={profile?.username || 'Нэр'} value={form.author}
                                        onChange={e => setForm({ ...form, author: e.target.value })} className="form-input" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>📂 Ангилал</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="form-input">
                                    <option value="Библи">📖 Библи</option>
                                    <option value="Номлол">🎤 Номлол</option>
                                    <option value="Гэрчлэл">✝️ Гэрчлэл</option>
                                    <option value="Сургаал">📝 Сургаал</option>
                                    <option value="Залбирал">🕊️ Залбирал</option>
                                </select>
                            </div>

                            {/* Audio File */}
                            <div className="form-group">
                                <label>🎧 Аудио файл (MP3)</label>
                                <div className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    onClick={() => !uploading && fileInputRef.current?.click()}>
                                    <input ref={fileInputRef} type="file" accept="audio/*" onChange={e => handleFileUpload(e.target.files[0])} style={{ display: 'none' }} />
                                    {uploading ? (
                                        <div className="upload-progress">
                                            <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                                            <p>Хуулж байна...</p>
                                        </div>
                                    ) : form.audio_url ? (
                                        <div className="upload-placeholder">
                                            <span className="upload-icon">✅</span>
                                            <p>Файл оруулсан!</p>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <span className="upload-icon">🎧</span>
                                            <p>MP3 файл чирж оруулах эсвэл дарж сонгох</p>
                                            <span className="upload-hint">MP3, MP4, WAV • 200MB хүртэл</span>
                                        </div>
                                    )}
                                </div>
                                {form.audio_url && (
                                    <button type="button" className="remove-image-btn" style={{ marginTop: '0.5rem', borderRadius: '8px' }}
                                        onClick={() => setForm({ ...form, audio_url: '' })}>✕ Файл хасах</button>
                                )}
                            </div>

                            {/* Link */}
                            <div className="form-group">
                                <label>🔗 Эсвэл линк оруулах</label>
                                <input type="url" placeholder="https://example.com/audiobook.mp3" value={form.link_url}
                                    onChange={e => setForm({ ...form, link_url: e.target.value })} className="form-input" />
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label>📝 Тайлбар / Товч агуулга</label>
                                <textarea placeholder="Номын товч агуулга..." value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="form-input form-textarea" rows={4} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
                                    {uploading ? 'Хадгалж байна...' : '📚 Ном нэмэх'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Цуцлах</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories */}
                <div className="songs-categories">
                    {categories.map(cat => (
                        <button key={cat} className={`songs-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}>
                            {cat === 'Библи' ? '📖 ' : cat === 'Номлол' ? '🎤 ' : cat === 'Гэрчлэл' ? '✝️ ' : cat === 'Сургаал' ? '📝 ' : cat === 'Залбирал' ? '🕊️ ' : ''}
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Books List */}
                {filtered.length === 0 ? (
                    <div className="empty-state"><p>Энэ ангилалд ном байхгүй байна.</p></div>
                ) : (
                    <div className="audiobook-grid">
                        {filtered.map(book => (
                            <div key={book.id} className={`audiobook-card ${currentTrack?.id === book.id ? 'audiobook-active' : ''}`}>
                                {/* Cover */}
                                <div className="audiobook-cover" onClick={() => playBook(book)}>
                                    {book.cover_image ? (
                                        <img src={book.cover_image} alt={book.title} />
                                    ) : (
                                        <div className="audiobook-cover-placeholder">
                                            <span>📖</span>
                                        </div>
                                    )}
                                    <div className="audiobook-play-overlay">
                                        {currentTrack?.id === book.id && isPlaying ? '⏸' : '▶'}
                                    </div>
                                    {currentTrack?.id === book.id && isPlaying && (
                                        <div className="audiobook-playing-badge">
                                            <div className="song-equalizer"><span></span><span></span><span></span></div>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="audiobook-info">
                                    <span className="song-category-badge">{book.category}</span>
                                    <h3 className="audiobook-title">{book.title}</h3>
                                    <p className="audiobook-author">✍️ {book.author}</p>

                                    {book.description && (
                                        <>
                                            <button className="audiobook-desc-toggle"
                                                onClick={() => setExpandedBook(expandedBook === book.id ? null : book.id)}>
                                                {expandedBook === book.id ? '📋 Хаах ▲' : '📋 Дэлгэрэнгүй ▼'}
                                            </button>
                                            {expandedBook === book.id && (
                                                <p className="audiobook-description">{book.description}</p>
                                            )}
                                        </>
                                    )}

                                    {book.link_url && (
                                        <a href={book.link_url} target="_blank" rel="noopener noreferrer" className="audiobook-link">
                                            🔗 Линк нээх
                                        </a>
                                    )}

                                    <div className="audiobook-actions">
                                        <button className="btn btn-sm btn-primary" onClick={() => playBook(book)}>
                                            {currentTrack?.id === book.id && isPlaying ? '⏸ Зогсоох' : '▶ Сонсох'}
                                        </button>
                                        {user && (book.user_id === user.id || isAdmin) && (
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(book.id)}>🗑️</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer style={{ marginBottom: currentTrack ? '90px' : '0' }}>
                <div className="container">
                    <h2 className="site-title" style={{ fontSize: '2rem' }}>FAITH NEWS</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>© 2026 Христийн Мэдээ Төв.</p>
                    <ul className="nav-links" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                        <li><Link to="/">Нүүр</Link></li>
                        <li><Link to="/songs">Магтаал дуу</Link></li>
                        <li><Link to="/audiobooks">Сонсдог ном</Link></li>
                        <li><Link to="/admin">Админ</Link></li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}

export default Audiobooks;
