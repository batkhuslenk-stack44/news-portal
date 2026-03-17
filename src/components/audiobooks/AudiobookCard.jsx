import React from 'react';

function AudiobookCard({
    book,
    currentTrack,
    isPlaying,
    user,
    isAdmin,
    playBook,
    onDelete,
    expandedBook,
    setExpandedBook
}) {
    return (
        <div className={`audiobook-card ${currentTrack?.id === book.id ? 'audiobook-active' : ''}`}>
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
                    {(isAdmin || (user && book.user_id === user.id)) && (
                        <button className="btn btn-sm btn-danger" onClick={() => onDelete(book.id)}>🗑️</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AudiobookCard;
