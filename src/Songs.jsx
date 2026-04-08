import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseAdmin } from './lib/supabase';
import { usePlayer } from './context/PlayerContext';
import Header from './components/Header';
import SongUploadForm from './components/songs/SongUploadForm';
import SongCard from './components/songs/SongCard';
import { toast } from 'react-toastify';
import ConfirmModal from './components/ConfirmModal';

function Songs() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lyricsOpen, setLyricsOpen] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Бүгд');
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const { currentTrack, isPlaying, playTrack } = usePlayer();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const categories = ['Бүгд', 'Магтаал', 'Залбирал', 'Монгол магтаал'];

    useEffect(() => {
        fetchSongs();
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

    async function fetchSongs() {
        setLoading(true);
        const { data, error } = await supabase.from('worship_songs').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            setSongs(data);
        }
        setLoading(false);
    }

    function playSong(song) {
        playTrack(song, songs);
    }

    function toggleLyrics(songId) {
        setLyricsOpen(lyricsOpen === songId ? null : songId);
    }

    function getFilteredSongs() {
        if (activeCategory === 'Бүгд') return songs;
        return songs.filter(s => s.category === activeCategory);
    }

    function showMsg(text, type = 'success') {
        if (type === 'error') toast.error(text);
        else toast.success(text);
    }

    async function handleSubmitSong(form) {
        const songData = {
            title: form.title.trim(),
            artist: form.artist.trim() || (profile?.username || 'Unknown'),
            category: form.category,
            audio_url: form.audio_url,
            audio_type: form.audio_type || 'audio',
            lyrics: form.lyrics.trim() || null,
            user_id: user.id,
        };

        const { error } = await supabase.from('worship_songs').insert([songData]);

        if (error) {
            showMsg('Алдаа: ' + error.message, 'error');
            return false;
        } else {
            showMsg('Дуу амжилттай нэмэгдлээ! 🎉');
            setShowUploadForm(false);
            fetchSongs();
            return true;
        }
    }

    function handleDeleteSong(songId) {
        setDeletingId(songId);
    }

    async function confirmDelete() {
        if (!deletingId) return;
        const songId = deletingId;
        setDeletingId(null);
        
        const client = isAdmin ? supabaseAdmin : supabase;
        const { error } = await client.from('worship_songs').delete().eq('id', songId);
        
        if (!error) {
            fetchSongs();
            showMsg('Дуу устгагдлаа! 🗑️');
        } else {
            showMsg('Устгахад алдаа: ' + error.message, 'error');
        }
    }

    const filteredSongs = getFilteredSongs();

    if (loading) {
        return (
            <div className="app">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Дуу ачааллаж байна...</p>
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
                        <span>🎵 Магтаал Дуу</span>
                        <span>{songs.length} дуу</span>
                        {currentTrack && (
                            <span className="now-playing-badge">
                                🎧 Одоо тоглож байна: {currentTrack.title}
                            </span>
                        )}
                    </>
                }
            />

            <main className="container">
                <div className="songs-hero">
                    <h1 className="serif songs-hero-title">🎶 Магтаал Дуу</h1>
                    <p className="songs-hero-subtitle">Бурханд магтаал өргөн, зүрхнээсээ дуулъя</p>

                    {user ? (
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '1.2rem' }}
                            onClick={() => setShowUploadForm(!showUploadForm)}
                        >
                            {showUploadForm ? '✕ Хаах' : '➕ Дуу нэмэх'}
                        </button>
                    ) : (
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Дуу нэмэхийн тулд <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>нэвтэрнэ үү</Link>
                        </p>
                    )}
                </div>

                {showUploadForm && user && (
                    <SongUploadForm
                        user={user}
                        profile={profile}
                        onSubmit={handleSubmitSong}
                        onCancel={() => setShowUploadForm(false)}
                        showMessage={showMsg}
                    />
                )}

                <div className="songs-categories">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`songs-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat === 'Магтаал' ? '🙏 ' : cat === 'Залбирал' ? '🕊️ ' : cat === 'Монгол магтаал' ? '🇲🇳 ' : ''}
                            {cat}
                        </button>
                    ))}
                </div>

                {filteredSongs.length === 0 ? (
                    <div className="empty-state">
                        <p>Энэ ангилалд дуу байхгүй байна.</p>
                    </div>
                ) : (
                    <div className="songs-list">
                        {filteredSongs.map((song, index) => (
                            <SongCard
                                key={song.id}
                                song={song}
                                index={index}
                                currentTrack={currentTrack}
                                isPlaying={isPlaying}
                                user={user}
                                isAdmin={isAdmin}
                                playSong={playSong}
                                onDelete={handleDeleteSong}
                                lyricsOpen={lyricsOpen}
                                toggleLyrics={toggleLyrics}
                            />
                        ))}
                    </div>
                )}
            </main>

            <footer style={{ marginBottom: currentTrack ? '90px' : '0' }}>
                <div className="container">
                    <h2 className="site-title" style={{ fontSize: '2rem' }}>FAITH NEWS</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>© 2026 Христийн Мэдээ Төв. Бүх эрх хуулиар хамгаалагдсан.</p>
                    <ul className="nav-links" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                        <li><Link to="/">Нүүр хуудас</Link></li>
                        <li><Link to="/testimonies">Гэрчлэл</Link></li>
                        <li><Link to="/songs">Магтаал дуу</Link></li>
                        <li><Link to="/admin">Админ</Link></li>
                    </ul>
                </div>
            </footer>

            <ConfirmModal 
                isOpen={!!deletingId} 
                message="Энэ дууг устгах уу?" 
                onConfirm={confirmDelete} 
                onCancel={() => setDeletingId(null)} 
            />
        </div>
    );
}

export default Songs;
