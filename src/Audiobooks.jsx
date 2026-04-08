import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseAdmin } from './lib/supabase';
import { usePlayer } from './context/PlayerContext';
import Header from './components/Header';
import AudiobookUploadForm from './components/audiobooks/AudiobookUploadForm';
import AudiobookCard from './components/audiobooks/AudiobookCard';
import { toast } from 'react-toastify';
import ConfirmModal from './components/ConfirmModal';

function Audiobooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Бүгд');
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [expandedBook, setExpandedBook] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const { currentTrack, isPlaying, playTrack } = usePlayer();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

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
        const { data, error } = await supabase.from('audiobooks').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            setBooks(data);
        }
        setLoading(false);
    }

    function playBook(book) {
        playTrack(book, books);
    }

    function getFiltered() {
        if (activeCategory === 'Бүгд') return books;
        return books.filter(b => b.category === activeCategory);
    }

    function showMsg(text, type = 'success') {
        if (type === 'error') toast.error(text);
        else toast.success(text);
    }

    async function handleSubmitBook(form) {
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
            return false;
        } else {
            showMsg('Ном амжилттай нэмэгдлээ! 📚');
            setShowForm(false);
            fetchBooks();
            return true;
        }
    }

    function handleDelete(bookId) {
        setDeletingId(bookId);
    }

    async function confirmDelete() {
        if (!deletingId) return;
        const bookId = deletingId;
        setDeletingId(null);

        const client = isAdmin ? supabaseAdmin : supabase;
        const { error } = await client.from('audiobooks').delete().eq('id', bookId);

        if (!error) {
            fetchBooks();
            showMsg('Ном устгагдлаа! 🗑️');
        } else {
            showMsg('Устгахад алдаа: ' + error.message, 'error');
        }
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

                {showForm && user && (
                    <AudiobookUploadForm
                        user={user}
                        profile={profile}
                        onSubmit={handleSubmitBook}
                        onCancel={() => setShowForm(false)}
                        showMessage={showMsg}
                    />
                )}

                <div className="songs-categories">
                    {categories.map(cat => (
                        <button key={cat} className={`songs-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}>
                            {cat === 'Библи' ? '📖 ' : cat === 'Номлол' ? '🎤 ' : cat === 'Гэрчлэл' ? '✝️ ' : cat === 'Сургаал' ? '📝 ' : cat === 'Залбирал' ? '🕊️ ' : ''}
                            {cat}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="empty-state"><p>Энэ ангилалд ном байхгүй байна.</p></div>
                ) : (
                    <div className="audiobook-grid">
                        {filtered.map(book => (
                            <AudiobookCard
                                key={book.id}
                                book={book}
                                currentTrack={currentTrack}
                                isPlaying={isPlaying}
                                user={user}
                                isAdmin={isAdmin}
                                playBook={playBook}
                                onDelete={handleDelete}
                                expandedBook={expandedBook}
                                setExpandedBook={setExpandedBook}
                            />
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
            
            <ConfirmModal 
                isOpen={!!deletingId} 
                message="Энэ номыг устгах уу?" 
                onConfirm={confirmDelete} 
                onCancel={() => setDeletingId(null)} 
            />
        </div>
    );
}

export default Audiobooks;
