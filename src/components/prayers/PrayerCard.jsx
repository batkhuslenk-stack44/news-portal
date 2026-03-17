import React from 'react';
import PrayerCommentSection from './PrayerCommentSection';
import { timeAgo, renderContent } from '../../utils/formatters';

function PrayerCard({
    prayer,
    user,
    isAdmin,
    isLiked,
    onLike,
    onDelete,
    comments,
    expandedComments,
    onCommentSubmit,
    onCommentDelete,
    commentInput,
    onCommentInputChange
}) {
    return (
        <div className="feed-card">
            <div className="feed-card-header">
                <div className="feed-avatar">{prayer.username.charAt(0).toUpperCase()}</div>
                <div className="feed-card-user">
                    <span className="feed-card-username">{prayer.username}</span>
                    <span className="feed-card-time">{timeAgo(prayer.created_at)}</span>
                </div>
                {(isAdmin || (user && user.id === prayer.user_id)) && (
                    <button className="feed-menu-btn" onClick={() => onDelete(prayer.id)}>🗑️</button>
                )}
            </div>

            <p className="feed-card-content">{renderContent(prayer.content)}</p>
            {prayer.image_url && <div className="feed-card-media"><img src={prayer.image_url} alt="" className="feed-card-img" /></div>}
            {prayer.video_url && (
                <div className="feed-card-media">
                    <video controls src={prayer.video_url} className="feed-card-img" style={{ maxHeight: '400px', backgroundColor: '#000' }} />
                </div>
            )}

            <div className="feed-counts">
                {prayer.likeCount > 0 && <span className="feed-like-count">🙏 {prayer.likeCount} хүн залбирч байна</span>}
                {prayer.commentCount > 0 && <span className="feed-comment-count">💬 {prayer.commentCount} сэтгэгдэл</span>}
            </div>

            <div className="feed-action-bar">
                <button onClick={() => onLike(prayer.id)} className={`feed-action-btn ${isLiked ? 'active' : ''}`}>
                    {isLiked ? '🙌' : '🙏'} Залбиръя
                </button>
                <button className="feed-action-btn" onClick={() => document.getElementById(`comment-input-${prayer.id}`)?.focus()}>
                    💬 Сэтгэгдэл
                </button>
            </div>

            <PrayerCommentSection
                prayerId={prayer.id}
                comments={comments}
                user={user}
                isAdmin={isAdmin}
                onCommentSubmit={onCommentSubmit}
                onCommentDelete={onCommentDelete}
                commentInput={commentInput}
                onCommentInputChange={onCommentInputChange}
                expandedComments={expandedComments}
            />
        </div>
    );
}

export default PrayerCard;
