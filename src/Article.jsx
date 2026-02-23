import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';

function Article() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchArticle();
        fetchComments();
        checkUser();
    }, [id]);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();
            setProfile(data);
        }
    }

    async function fetchArticle() {
        setLoading(true);
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching article:', error);
        } else {
            setArticle(data);
        }
        setLoading(false);
    }

    async function fetchComments() {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('news_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments(data || []);
        }
    }

    function showMessage(text, type = 'success') {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }

    async function handleCommentSubmit(e) {
        e.preventDefault();

        if (!newComment.trim()) {
            showMessage('Сэтгэгдэл бичнэ үү!', 'error');
            return;
        }

        setCommentLoading(true);

        const username = profile?.username || user?.user_metadata?.username || 'User';

        const { error } = await supabase
            .from('comments')
            .insert([{
                news_id: parseInt(id),
                user_id: user.id,
                username: username,
                content: newComment.trim(),
            }]);

        if (error) {
            showMessage('Сэтгэгдэл нэмэхэд алдаа: ' + error.message, 'error');
        } else {
            showMessage('Сэтгэгдэл нэмэгдлээ! ✅');
            setNewComment('');
            fetchComments();
        }
        setCommentLoading(false);
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('mn-MN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    if (loading) {
        return (
            <div className="app">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Ачааллаж байна...</p>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="app">
                <div className="error-container">
                    <h2>Мэдээ олдсонгүй</h2>
                    <Link to="/" className="btn btn-primary">Нүүр хуудас руу буцах</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            {/* Header */}
            <header>
                <div className="container">
                    <Link to="/" className="site-title" style={{ textDecoration: 'none', display: 'block' }}>ИТГЭЛИЙН ЗАМ</Link>
                    <nav>
                        <ul className="nav-links">
                            <li><Link to="/">← Нүүр хуудас</Link></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main className="container">
                {/* Article */}
                <article className="article-detail">
                    <span className="article-category">{article.category}</span>
                    <h1 className="article-detail-title serif">{article.title}</h1>
                    <div className="article-meta">
                        <span>📅 {article.date}</span>
                    </div>
                    <img src={article.image} alt={article.title} className="article-detail-img" />
                    <div className="article-content">
                        <p>{article.excerpt}</p>
                    </div>
                </article>

                {/* Comments Section */}
                <section className="comments-section">
                    <h2 className="serif comments-title">
                        💬 Сэтгэгдэлүүд ({comments.length})
                    </h2>

                    {message.text && (
                        <div className={`message message-${message.type}`}>{message.text}</div>
                    )}

                    {/* Comment Form */}
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <div className="comment-form-header">
                                <div className="comment-avatar">
                                    {(profile?.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="comment-form-name">
                                    {profile?.username || user?.user_metadata?.username || 'User'}
                                </span>
                            </div>
                            <textarea
                                placeholder="Сэтгэгдэл бичих..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                className="form-input form-textarea"
                                rows={3}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={commentLoading}
                            >
                                {commentLoading ? 'Илгээж байна...' : '💬 Сэтгэгдэл илгээх'}
                            </button>
                        </form>
                    ) : (
                        <div className="comment-login-prompt">
                            <p>Сэтгэгдэл бичихийн тулд нэвтэрнэ үү</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Link to="/login" className="btn btn-primary">🔑 Нэвтрэх</Link>
                                <Link to="/register" className="btn btn-secondary">📝 Бүртгүүлэх</Link>
                            </div>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <div className="empty-comments">
                                <p>Сэтгэгдэл байхгүй байна. Та эхний сэтгэгдэл бичээрэй! 😊</p>
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="comment-card">
                                    <div className="comment-header">
                                        <div className="comment-avatar">
                                            {comment.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="comment-info">
                                            <span className="comment-username">{comment.username}</span>
                                            <span className="comment-date">{formatDate(comment.created_at)}</span>
                                        </div>
                                    </div>
                                    <p className="comment-content">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <footer>
                <div className="container">
                    <h2 className="site-title" style={{ fontSize: '2rem' }}>ИТГЭЛИЙН ЗАМ</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>© 2026 Христийн Мэдээ Төв. Бүх эрх хуулиар хамгаалагдсан.</p>
                </div>
            </footer>
        </div>
    );
}

export default Article;
