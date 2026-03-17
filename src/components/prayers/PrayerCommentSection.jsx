import React from 'react';
import { timeAgo } from '../../utils/formatters';

function PrayerCommentSection({ 
    prayerId, 
    comments, 
    user, 
    isAdmin, 
    onCommentSubmit, 
    onCommentDelete, 
    commentInput, 
    onCommentInputChange,
    expandedComments
}) {
    const visibleComments = () => {
        const all = comments || [];
        if (expandedComments.has(prayerId)) return all;
        return all.slice(-2);
    };

    return (
        <div className="feed-comments">
            {visibleComments().map(c => (
                <div key={c.id} className="feed-comment">
                    <div className="feed-comment-avatar">{c.username.charAt(0).toUpperCase()}</div>
                    <div className="feed-comment-body">
                        <div className="feed-comment-bubble">
                            <span className="feed-comment-name">{c.username}</span>
                            <span className="feed-comment-text">{c.content}</span>
                        </div>
                        <div className="feed-comment-meta">
                            <span>{timeAgo(c.created_at)}</span>
                            {(isAdmin || (user && user.id === c.user_id)) && (
                                <button className="feed-comment-delete" onClick={() => onCommentDelete(c.id, prayerId)}>Устгах</button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {user && (
                <div className="feed-comment-input-row">
                    <div className="feed-comment-input-wrap">
                        <input
                            id={`comment-input-${prayerId}`}
                            type="text"
                            placeholder="Амэн..."
                            value={commentInput || ''}
                            onChange={e => onCommentInputChange(prayerId, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') onCommentSubmit(prayerId); }}
                            className="feed-comment-input"
                        />
                        <button onClick={() => onCommentSubmit(prayerId)} className="feed-comment-send">➤</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PrayerCommentSection;
