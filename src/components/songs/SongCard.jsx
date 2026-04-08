import React from 'react';

function SongCard({
    song,
    index,
    currentTrack,
    isPlaying,
    user,
    isAdmin,
    playSong,
    onDelete,
    lyricsOpen,
    toggleLyrics
}) {
    const handleDownload = async (e, song) => {
        e.stopPropagation();
        try {
            const response = await fetch(song.audio_url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            const extension = song.audio_type === 'video' ? 'mp4' : 'mp3';
            link.download = `${song.artist || 'Дуу'} - ${song.title || 'Татах'}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
            window.open(song.audio_url, '_blank');
        }
    };

    return (
        <div className={`song-card ${currentTrack?.id === song.id ? 'song-active' : ''}`}>
            <div className="song-card-main" onClick={() => playSong(song)}>
                {/* Track Number / Play indicator */}
                <div className="song-number">
                    {currentTrack?.id === song.id && isPlaying ? (
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
                    {currentTrack?.id === song.id && isPlaying ? '⏸' : '▶'}
                </button>

                {/* Download Button */}
                {song.audio_url && (
                    <button
                        className="song-download-btn"
                        onClick={(e) => handleDownload(e, song)}
                        title="Татах"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem' }}
                    >
                        ⬇️
                    </button>
                )}

                {/* Delete (own songs or admin) */}
                {(isAdmin || (user && song.user_id === user.id)) && (
                    <button
                        className="song-delete-btn"
                        onClick={(e) => { e.stopPropagation(); onDelete(song.id); }}
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
    );
}

export default SongCard;
