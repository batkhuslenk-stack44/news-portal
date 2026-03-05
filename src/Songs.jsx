import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabase';

function Songs() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [lyricsOpen, setLyricsOpen] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Бүгд');
    const [volume, setVolume] = useState(0.8);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });
    const [dragActive, setDragActive] = useState(false);
    const audioRef = useRef(null);
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const fileInputRef = useRef(null);

    // Upload form state
    const [form, setForm] = useState({
        title: '',
        artist: '',
        category: 'Магтаал',
        lyrics: '',
        audio_url: '',
        audio_type: '', // 'audio' or 'video'
    });

    const categories = ['Бүгд', 'Магтаал', 'Залбирал', 'Гэрчлэл'];

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
        const { data } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', userId)
            .single();
        setProfile(data);
    }

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
            }
        };

        const handleEnded = () => { playNext(); };
        const handleLoadedMetadata = () => { setDuration(audio.duration); };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [currentSong, songs]);

    async function fetchSongs() {
        setLoading(true);
        const { data, error } = await supabase
            .from('worship_songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setSongs(data);
        }
        setLoading(false);
    }

    // ===== Playback =====
    function playSong(song) {
        if (currentSong?.id === song.id) {
            togglePlay();
            return;
        }

        setCurrentSong(song);
        setIsPlaying(true);
        setProgress(0);
        setCurrentTime(0);

        setTimeout(() => {
            const media = song.audio_type === 'video' ? videoRef.current : audioRef.current;
            if (media) {
                media.src = song.audio_url;
                media.volume = volume;
                media.play().catch(() => { });
            }
        }, 50);
    }

    function togglePlay() {
        const media = currentSong?.audio_type === 'video' ? videoRef.current : audioRef.current;
        if (!media || !currentSong) return;

        if (isPlaying) {
            media.pause();
        } else {
            media.play().catch(() => { });
        }
        setIsPlaying(!isPlaying);
    }

    function playNext() {
        const filteredSongs = getFilteredSongs();
        const idx = filteredSongs.findIndex(s => s.id === currentSong?.id);
        if (idx < filteredSongs.length - 1) playSong(filteredSongs[idx + 1]);
        else if (filteredSongs.length > 0) playSong(filteredSongs[0]);
    }

    function playPrev() {
        const filteredSongs = getFilteredSongs();
        const idx = filteredSongs.findIndex(s => s.id === currentSong?.id);
        if (idx > 0) playSong(filteredSongs[idx - 1]);
        else if (filteredSongs.length > 0) playSong(filteredSongs[filteredSongs.length - 1]);
    }

    function handleProgressClick(e) {
        const media = currentSong?.audio_type === 'video' ? videoRef.current : audioRef.current;
        if (!media || !media.duration) return;
        const bar = progressRef.current;
        const rect = bar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        media.currentTime = percent * media.duration;
    }

    function handleVolumeChange(e) {
        const v = parseFloat(e.target.value);
        setVolume(v);
        if (audioRef.current) audioRef.current.volume = v;
        if (videoRef.current) videoRef.current.volume = v;
    }

    function formatTime(sec) {
        if (!sec || isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function toggleLyrics(songId) {
        setLyricsOpen(lyricsOpen === songId ? null : songId);
    }

    function getFilteredSongs() {
        if (activeCategory === 'Бүгд') return songs;
        return songs.filter(s => s.category === activeCategory);
    }

    // ===== Upload =====
    function showMsg(text, type = 'success') {
        setUploadMessage({ text, type });
        setTimeout(() => setUploadMessage({ text: '', type: '' }), 5000);
    }

    async function handleFileUpload(file) {
        if (!file) return;

        const allowedAudio = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav'];
        const allowedVideo = ['video/mp4', 'video/webm', 'video/ogg'];
        const allAllowed = [...allowedAudio, ...allowedVideo];

        if (!allAllowed.includes(file.type)) {
            showMsg('Зөвхөн MP3, MP4, WAV, OGG файл оруулна уу!', 'error');
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            showMsg('Файлын хэмжээ 100MB-аас бага байх ёстой!', 'error');
            return;
        }

        setUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const isVideo = allowedVideo.includes(file.type);

        const { data, error } = await supabase.storage
            .from('worship-songs')
            .upload(fileName, file);

        if (error) {
            showMsg('Файл upload хийхэд алдаа: ' + error.message, 'error');
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('worship-songs')
            .getPublicUrl(fileName);

        setForm({ ...form, audio_url: publicUrl, audio_type: isVideo ? 'video' : 'audio' });
        showMsg('Файл амжилттай upload хийгдлээ! 🎵');
        setUploading(false);
    }

    function handleFileChange(e) {
        handleFileUpload(e.target.files[0]);
    }

    function handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
    }

    async function handleSubmitSong(e) {
        e.preventDefault();

        if (!form.title.trim()) {
            showMsg('Дууны нэр оруулна уу!', 'error');
            return;
        }
        if (!form.audio_url) {
            showMsg('Дуу файл оруулна уу!', 'error');
            return;
        }

        setUploading(true);

        const songData = {
            title: form.title.trim(),
            artist: form.artist.trim() || (profile?.username || 'Unknown'),
            category: form.category,
            audio_url: form.audio_url,
            audio_type: form.audio_type || 'audio',
            lyrics: form.lyrics.trim() || null,
            user_id: user.id,
        };

        const { error } = await supabase
            .from('worship_songs')
            .insert([songData]);

        if (error) {
            showMsg('Алдаа: ' + error.message, 'error');
        } else {
            showMsg('Дуу амжилттай нэмэгдлээ! 🎉');
            setForm({ title: '', artist: '', category: 'Магтаал', lyrics: '', audio_url: '', audio_type: '' });
            setShowUploadForm(false);
            fetchSongs();
        }
        setUploading(false);
    }

    async function handleDeleteSong(songId) {
        if (!window.confirm('Энэ дууг устгах уу?')) return;
        const { error } = await supabase
            .from('worship_songs')
            .delete()
            .eq('id', songId);

        if (!error) {
            if (currentSong?.id === songId) {
                setCurrentSong(null);
                setIsPlaying(false);
            }
            fetchSongs();
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
            <audio ref={audioRef} />
            <video ref={videoRef} style={{ display: 'none' }} />

            {/* Header */}
            <header>
                <div className="container">
                    <Link to="/" className="site-title" style={{ textDecoration: 'none', display: 'block' }}>
                        ИТГЭЛИЙН ЗАМ
                    </Link>
                    <div className="date-bar">
                        <span>🎵 Магтаал Дуу</span>
                        <span>{songs.length} дуу</span>
                    </div>
                    <nav>
                        <ul className="nav-links">
                            <li><Link to="/">🏠 Нүүр</Link></li>
                            <li><Link to="/testimonies">Гэрчлэл</Link></li>
                            <li><Link to="/songs" style={{ color: 'var(--accent-color)' }}>🎵 Магтаал дуу</Link></li>
                            {user ? (
                                <>
                                    <li className="user-nav-item">
                                        <span className="user-avatar-small">{(profile?.username || 'U').charAt(0).toUpperCase()}</span>
                                        <span className="user-name-nav">{profile?.username || 'User'}</span>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/login" className="btn btn-sm btn-primary">🔑 Нэвтрэх</Link></li>
                                    <li><Link to="/register" className="btn btn-sm btn-secondary">📝 Бүртгүүлэх</Link></li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>

            <main className="container">
                {/* Page Title */}
                <div className="songs-hero">
                    <h1 className="serif songs-hero-title">🎶 Магтаал Дуу</h1>
                    <p className="songs-hero-subtitle">Бурханд магтаал өргөн, зүрхнээсээ дуулъя</p>

                    {/* Add Song Button */}
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

                {/* Upload Form */}
                {showUploadForm && user && (
                    <div className="song-upload-form">
                        <h2 className="serif" style={{ marginBottom: '1.2rem', fontSize: '1.5rem' }}>🎵 Шинэ дуу нэмэх</h2>

                        {uploadMessage.text && (
                            <div className={`message message-${uploadMessage.type}`}>{uploadMessage.text}</div>
                        )}

                        <form onSubmit={handleSubmitSong}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>🎤 Дууны нэр *</label>
                                    <input
                                        type="text"
                                        placeholder="Жишээ: Бурханы хайр"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🎙️ Дуучин / Хамтлаг</label>
                                    <input
                                        type="text"
                                        placeholder={profile?.username || 'Нэр оруулна уу'}
                                        value={form.artist}
                                        onChange={e => setForm({ ...form, artist: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>📂 Ангилал</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="form-input"
                                >
                                    <option value="Магтаал">🙏 Магтаал</option>
                                    <option value="Залбирал">🕊️ Залбирал</option>
                                    <option value="Гэрчлэл">✝️ Гэрчлэл</option>
                                </select>
                            </div>

                            {/* Audio File Upload */}
                            <div className="form-group">
                                <label>🎶 Дуу файл (MP3, MP4) *</label>
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
                                        accept="audio/*,video/mp4"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    {uploading ? (
                                        <div className="upload-progress">
                                            <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                                            <p>Файл upload хийж байна...</p>
                                        </div>
                                    ) : form.audio_url ? (
                                        <div className="upload-placeholder">
                                            <span className="upload-icon">✅</span>
                                            <p>Файл амжилттай оруулсан!</p>
                                            <span className="upload-hint">{form.audio_type === 'video' ? '🎬 MP4 видео' : '🎵 MP3 аудио'}</span>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <span className="upload-icon">🎵</span>
                                            <p>MP3/MP4 файл чирж оруулах эсвэл дарж сонгох</p>
                                            <span className="upload-hint">MP3, MP4, WAV, OGG • 100MB хүртэл</span>
                                        </div>
                                    )}
                                </div>

                                {form.audio_url && (
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        style={{ marginTop: '0.5rem', borderRadius: '8px' }}
                                        onClick={() => setForm({ ...form, audio_url: '', audio_type: '' })}
                                    >
                                        ✕ Файл хасах
                                    </button>
                                )}
                            </div>

                            {/* URL оруулах */}
                            <div className="form-group">
                                <label>🔗 Эсвэл URL оруулах</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/song.mp3"
                                    value={form.audio_url}
                                    onChange={e => setForm({ ...form, audio_url: e.target.value, audio_type: e.target.value.includes('.mp4') ? 'video' : 'audio' })}
                                    className="form-input"
                                    disabled={uploading}
                                />
                            </div>

                            {/* Lyrics */}
                            <div className="form-group">
                                <label>📝 Дууны үг (заавал биш)</label>
                                <textarea
                                    placeholder="Дууны үгийг энд бичнэ үү...

Жишээ:
Бурханы хайр намайг хүрээлдэг
Түүний нигүүлсэл өдөр бүр шинэ

[Давталт]
Магтаал, магтаал..."
                                    value={form.lyrics}
                                    onChange={e => setForm({ ...form, lyrics: e.target.value })}
                                    className="form-input form-textarea"
                                    rows={8}
                                    style={{ minHeight: '160px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
                                    {uploading ? 'Хадгалж байна...' : '🎵 Дуу нэмэх'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadForm(false)}>
                                    Цуцлах
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Category Filter */}
                <div className="songs-categories">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`songs-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat === 'Магтаал' ? '🙏 ' : cat === 'Залбирал' ? '🕊️ ' : cat === 'Гэрчлэл' ? '✝️ ' : ''}
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Songs List */}
                {filteredSongs.length === 0 ? (
                    <div className="empty-state">
                        <p>Энэ ангилалд дуу байхгүй байна.</p>
                    </div>
                ) : (
                    <div className="songs-list">
                        {filteredSongs.map((song, index) => (
                            <div
                                key={song.id}
                                className={`song-card ${currentSong?.id === song.id ? 'song-active' : ''}`}
                            >
                                <div className="song-card-main" onClick={() => playSong(song)}>
                                    {/* Track Number / Play indicator */}
                                    <div className="song-number">
                                        {currentSong?.id === song.id && isPlaying ? (
                                            <div className="song-equalizer">
                                                <span></span><span></span><span></span>
                                            </div>
                                        ) : (
                                            <span className="song-idx">{index + 1}</span>
                                        )}
                                    </div>

                                    {/* Cover / Type Icon */}
                                    <div className="song-cover">
                                        {song.cover_image ? (
                                            <img src={song.cover_image} alt={song.title} />
                                        ) : (
                                            <div className="song-cover-placeholder">
                                                {song.audio_type === 'video' ? '🎬' : '🎵'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Song Info */}
                                    <div className="song-info">
                                        <h3 className="song-title">{song.title}</h3>
                                        <p className="song-artist">{song.artist}</p>
                                    </div>

                                    {/* Category & Type Badges */}
                                    <span className="song-category-badge">{song.category}</span>
                                    {song.audio_type === 'video' && (
                                        <span className="song-type-badge">MP4</span>
                                    )}

                                    {/* Play Button */}
                                    <button
                                        className="song-play-btn"
                                        onClick={(e) => { e.stopPropagation(); playSong(song); }}
                                    >
                                        {currentSong?.id === song.id && isPlaying ? '⏸' : '▶'}
                                    </button>

                                    {/* Delete (own songs) */}
                                    {user && song.user_id === user.id && (
                                        <button
                                            className="song-delete-btn"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id); }}
                                            title="Устгах"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>

                                {/* Lyrics Toggle */}
                                {song.lyrics && (
                                    <>
                                        <button
                                            className="song-lyrics-toggle"
                                            onClick={() => toggleLyrics(song.id)}
                                        >
                                            {lyricsOpen === song.id ? '📖 Үг хаах ▲' : '📖 Дууны үг ▼'}
                                        </button>
                                        {lyricsOpen === song.id && (
                                            <div className="song-lyrics">
                                                <pre>{song.lyrics}</pre>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Bottom Player Bar */}
            {currentSong && (
                <div className="player-bar">
                    <div className="player-bar-inner">
                        {/* Song Info */}
                        <div className="player-song-info">
                            <div className="player-cover">
                                {currentSong.cover_image ? (
                                    <img src={currentSong.cover_image} alt="" />
                                ) : (
                                    <div className="player-cover-placeholder">
                                        {currentSong.audio_type === 'video' ? '🎬' : '🎵'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="player-title">{currentSong.title}</p>
                                <p className="player-artist">{currentSong.artist}</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="player-controls">
                            <button className="player-btn" onClick={playPrev}>⏮</button>
                            <button className="player-btn player-btn-main" onClick={togglePlay}>
                                {isPlaying ? '⏸' : '▶'}
                            </button>
                            <button className="player-btn" onClick={playNext}>⏭</button>
                        </div>

                        {/* Progress */}
                        <div className="player-progress-section">
                            <span className="player-time">{formatTime(currentTime)}</span>
                            <div
                                className="player-progress-bar"
                                ref={progressRef}
                                onClick={handleProgressClick}
                            >
                                <div
                                    className="player-progress-fill"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <span className="player-time">{formatTime(duration)}</span>
                        </div>

                        {/* Volume */}
                        <div className="player-volume">
                            <span className="volume-icon">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                            />
                        </div>
                    </div>
                </div>
            )}

            <footer style={{ marginBottom: currentSong ? '90px' : '0' }}>
                <div className="container">
                    <h2 className="site-title" style={{ fontSize: '2rem' }}>ИТГЭЛИЙН ЗАМ</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>© 2026 Христийн Мэдээ Төв. Бүх эрх хуулиар хамгаалагдсан.</p>
                    <ul className="nav-links" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                        <li><Link to="/">Нүүр хуудас</Link></li>
                        <li><Link to="/testimonies">Гэрчлэл</Link></li>
                        <li><Link to="/songs">Магтаал дуу</Link></li>
                        <li><Link to="/admin">Админ</Link></li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}

export default Songs;
