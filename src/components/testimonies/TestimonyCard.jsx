import React from 'react';
import TestimonyCommentSection from './TestimonyCommentSection';
import { timeAgo, renderContent } from '../../utils/formatters';

function TestimonyCard({
    testimony,
    user,
    profile,
    isAdmin,
    activeMenu,
    setActiveMenu,
    onDelete,
    isLiked,
    onLike,
    expandedComments,
    setExpandedComments,
    comments,
    commentInput,
    onCommentInputChange,
    onCommentSubmit,
    commentLoading,
    onDeleteComment,
    showMessage
}) {
    return (
        <div className="feed-card">
            {/* Post Header */}
            <div className="feed-card-header">
                <div className="feed-avatar">{testimony.username.charAt(0).toUpperCase()}</div>
                <div className="feed-card-user">
                    <span className="feed-card-username">{testimony.username}</span>
                    <span className="feed-card-time">{timeAgo(testimony.created_at)}</span>
                </div>
                {(isAdmin || (user && user.id === testimony.user_id)) && (
                    <div className="feed-menu-wrap" onClick={e => e.stopPropagation()}>
                        <button
                            className="feed-menu-btn"
                            onClick={() => setActiveMenu(activeMenu === testimony.id ? null : testimony.id)}
                            title="Цэс"
                        >
                            ⋮
                        </button>
                        {activeMenu === testimony.id && (
                            <div className="feed-menu-dropdown">
                                <button onClick={() => { onDelete(testimony.id); setActiveMenu(null); }}>
                                    🗑️ Устгах
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            {testimony.title && testimony.title !== 'Пост' && (
                <h3 className="feed-card-title serif">{testimony.title}</h3>
            )}
            <p className="feed-card-content">{renderContent(testimony.content)}</p>

            {/* Media */}
            {testimony.image_url && (
                <div className="feed-card-media">
                    <img src={testimony.image_url} alt="" className="feed-card-img" />
                </div>
            )}
            {testimony.video_url && (
                <div className="feed-card-media">
                    <video src={testimony.video_url} controls className="feed-card-video" />
                </div>
            )}
            {testimony.link_url && (
                <a href={testimony.link_url} target="_blank" rel="noopener noreferrer" className="feed-card-link">
                    🔗 {testimony.link_url.length > 50 ? testimony.link_url.substring(0, 50) + '...' : testimony.link_url}
                </a>
            )}

            {/* Like & Comment Counts */}
            <div className="feed-counts">
                {testimony.likeCount > 0 && (
                    <span className="feed-like-count">❤️ {testimony.likeCount}</span>
                )}
                {testimony.commentCount > 0 && (
                    <span className="feed-comment-count"
                        onClick={() => setExpandedComments(prev => {
                            const s = new Set(prev);
                            s.has(testimony.id) ? s.delete(testimony.id) : s.add(testimony.id);
                            return s;
                        })}
                    >
                        💬 {testimony.commentCount} сэтгэгдэл
                    </span>
                )}
            </div>

            {/* Action Bar */}
            <div className="feed-action-bar">
                <button
                    onClick={() => onLike(testimony.id)}
                    className={`feed-action-btn ${isLiked ? 'active' : ''}`}
                >
                    {isLiked ? '❤️' : '🤍'} Таалагдсан
                </button>
                <button
                    className="feed-action-btn"
                    onClick={() => {
                        const el = document.getElementById(`comment-input-${testimony.id}`);
                        el?.focus();
                    }}
                >
                    💬 Сэтгэгдэл
                </button>
                <button
                    className="feed-action-btn"
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showMessage('Линк хуулагдлаа! 🔗');
                    }}
                >
                    🔗 Хуваалцах
                </button>
            </div>

            {/* Comments Section */}
            <TestimonyCommentSection
                testimonyId={testimony.id}
                comments={comments}
                user={user}
                profile={profile}
                isAdmin={isAdmin}
                commentInput={commentInput}
                onCommentInputChange={onCommentInputChange}
                onCommentSubmit={onCommentSubmit}
                commentLoading={commentLoading}
                expandedComments={expandedComments}
                setExpandedComments={setExpandedComments}
                onDeleteComment={onDeleteComment}
            />
        </div>
    );
}

export default TestimonyCard;
