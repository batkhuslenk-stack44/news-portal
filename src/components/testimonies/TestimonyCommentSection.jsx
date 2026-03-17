import React from 'react';
import { Link } from 'react-router-dom';
import { timeAgo } from '../../utils/formatters';

function TestimonyCommentSection({
    testimonyId,
    comments,
    user,
    profile,
    isAdmin,
    commentInput,
    onCommentInputChange,
    onCommentSubmit,
    commentLoading,
    expandedComments,
    setExpandedComments,
    onDeleteComment
}) {
    const visibleComments = () => {
        const all = comments || [];
        if (expandedComments.has(testimonyId)) return all;
        return all.slice(-2);
    };

    const allComments = comments || [];

    return (
        <div className="feed-comments">
            {allComments.length > 2 && !expandedComments.has(testimonyId) && (
                <button
                    className="feed-show-more-comments"
                    onClick={() => setExpandedComments(prev => new Set(prev).add(testimonyId))}
                >
                    Бүх {allComments.length} сэтгэгдлийг үзэх
                </button>
            )}

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
                                <button className="feed-comment-delete" onClick={() => onDeleteComment(c.id, testimonyId)}>
                                    Устгах
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {user ? (
                <div className="feed-comment-input-row">
                    <div className="feed-comment-avatar">{(profile?.username || 'U').charAt(0).toUpperCase()}</div>
                    <div className="feed-comment-input-wrap">
                        <input
                            id={`comment-input-${testimonyId}`}
                            type="text"
                            placeholder="Сэтгэгдэл бичих..."
                            value={commentInput || ''}
                            onChange={e => onCommentInputChange(testimonyId, e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onCommentSubmit(testimonyId);
                                }
                            }}
                            className="feed-comment-input"
                            disabled={commentLoading}
                        />
                        <button
                            onClick={() => onCommentSubmit(testimonyId)}
                            className="feed-comment-send"
                            disabled={!(commentInput || '').trim() || commentLoading}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            ) : (
                <div className="feed-comment-login">
                    <Link to="/login">Нэвтэрч</Link> сэтгэгдэл бичнэ үү
                </div>
            )}
        </div>
    );
}

export default TestimonyCommentSection;
