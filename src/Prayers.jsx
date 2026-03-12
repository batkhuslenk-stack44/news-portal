import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import { uploadToCloudinary } from './lib/cloudinary';

function Prayers() {
    const [prayers, setPrayers] = useState([]);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [userLikes, setUserLikes] = useState(new Set());
    const [form, setForm] = useState({ title: '', content: '', image_url: '', video_url: '', link_url: '' });
    const [postFormFocused, setPostFormFocused] = useState(false);
    const [comments, setComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [commentLoading, setCommentLoading] = useState({});
    const [activeMenu, setActiveMenu] = useState(null);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    useEffect(() => {
        checkUser();
        fetchPrayers();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchUserLikes(session.user.id);
            } else {
                setProfile(null);
                setUserLikes(new Set());
            }
        });

        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);

        return () => {
            subscription.unsubscribe();
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            fetchProfile(user.id);
            fetchUserLikes(user.id);
        }
    }

    async function fetchProfile(userId) {
        const { data } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', userId)
            .single();
        setProfile(data);
    }

    async function fetchPrayers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('prayers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching prayers:', error);
        } else {
            const prayersWithCounts = await Promise.all(
                (data || []).map(async (p) => {
                    const [likesRes, commentsRes] = await Promise.all([
                        supabase.from('prayer_likes').select('*', { count: 'exact', head: true }).eq('prayer_id', p.id),
                        supabase.from('prayer_comments').select('*', { count: 'exact', head: true }).eq('prayer_id', p.id),
                    ]);
                    return { ...p, likeCount: likesRes.count || 0, commentCount: commentsRes.count || 0 };
                })
            );
            setPrayers(prayersWithCounts);

            const allComments = {};
            for (const p of (data || [])) {
                const { data: cData } = await supabase
                    .from('prayer_comments')
                    .select('*')
                    .eq('prayer_id', p.id)
                    .order('created_at', { ascending: true });
                allComments[p.id] = cData || [];
            }
            setComments(allComments);
        }
        setLoading(false);
    }

    async function fetchUserLikes(userId) {
        const { data } = await supabase
            .from('prayer_likes')
            .select('prayer_id')
            .eq('user_id', userId);

        if (data) {
            setUserLikes(new Set(data.map(l => l.prayer_id)));
        }
    }

    function showMessage(text, type = 'success') {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }

    function timeAgo(dateStr) {
        const now = new Date();
        const date = new Date(dateStr);
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Саяхан';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} минутын өмнө`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} цагийн өмнө`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Өчигдөр';
        if (days < 7) return `${days} өдрийн өмнө`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} долоо хоногийн өмнө`;
        return date.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    async function handleFileUpload(file, type) {
        if (!file) return null;
        setUploading(true);
        try {
            const result = await uploadToCloudinary(file, type === 'video' ? 'video' : 'auto');
            setUploading(false);
            return result.url;
        } catch (error) {
            showMessage(`${type === 'image' ? 'Зураг' : 'Бичлэг'} хуулахад алдаа: ` + error.message, 'error');
            setUploading(false);
            return null;
        }
    }

    async function handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        const url = await handleFileUpload(file, 'image');
        if (url) {
            setForm(prev => ({ ...prev, image_url: url }));
            showMessage('Зураг амжилттай хуулагдлаа! 📸');
        }
    }

    async function handleVideoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        showMessage('Бичлэг хуулж байна... Түр хүлээнэ үү 🎬');
        const url = await handleFileUpload(file, 'video');
        if (url) {
            setForm(prev => ({ ...prev, video_url: url }));
            showMessage('Бичлэг амжилттай хуулагдлаа! 🎬');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.content.trim()) {
            showMessage('Агуулга бичнэ үү!', 'error');
            return;
        }

        if (!user) {
            showMessage('Нэвтэрсэн байх шаардлагатай!', 'error');
            return;
        }

        setSubmitLoading(true);
        const username = profile?.username || user?.user_metadata?.username || 'User';

        const insertData = {
            user_id: user.id,
            username: username,
            title: form.title.trim() || 'Залбирал',
            content: form.content.trim(),
        };
        if (form.image_url) insertData.image_url = form.image_url;
        if (form.video_url) insertData.video_url = form.video_url;
        if (form.link_url && form.link_url.trim()) insertData.link_url = form.link_url.trim();

        const { data, error } = await supabase
            .from('prayers')
            .insert([insertData])
            .select();

        if (error) {
            showMessage('Залбирал нэмэхэд алдаа: ' + error.message, 'error');
        } else {
            showMessage('Залбирал амжилттай нийтлэгдлээ! 🙏');
            setForm({ title: '', content: '', image_url: '', video_url: '', link_url: '' });
            setPostFormFocused(false);
            fetchPrayers();
        }
        setSubmitLoading(false);
    }

    async function handleLike(prayerId) {
        if (!user) {
            showMessage('Лайк өгөхийн тулд нэвтэрнэ үү!', 'error');
            return;
        }

        const isLiked = userLikes.has(prayerId);

        if (isLiked) {
            const { error } = await supabase
                .from('prayer_likes')
                .delete()
                .eq('prayer_id', prayerId)
                .eq('user_id', user.id);

            if (!error) {
                setUserLikes(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(prayerId);
                    return newSet;
                });
                setPrayers(prev =>
                    prev.map(p => p.id === prayerId ? { ...p, likeCount: p.likeCount - 1 } : p)
                );
            }
        } else {
            const { error } = await supabase
                .from('prayer_likes')
                .insert([{ prayer_id: prayerId, user_id: user.id }]);

            if (!error) {
                setUserLikes(prev => new Set(prev).add(prayerId));
                setPrayers(prev =>
                    prev.map(p => p.id === prayerId ? { ...p, likeCount: p.likeCount + 1 } : p)
                );
            }
        }
    }

    async function handleCommentSubmit(prayerId) {
        const content = (commentInputs[prayerId] || '').trim();
        if (!content) return;
        if (!user) {
            showMessage('Сэтгэгдэл бичихийн тулд нэвтэрнэ үү!', 'error');
            return;
        }

        setCommentLoading(prev => ({ ...prev, [prayerId]: true }));
        const username = profile?.username || user?.user_metadata?.username || 'User';

        const { data, error } = await supabase
            .from('prayer_comments')
            .insert([{
                prayer_id: prayerId,
                user_id: user.id,
                username: username,
                content: content,
            }])
            .select();

        if (error) {
            showMessage('Сэтгэгдэл нэмэхэд алдаа: ' + error.message, 'error');
        } else {
            setCommentInputs(prev => ({ ...prev, [prayerId]: '' }));
            setComments(prev => ({
                ...prev,
                [prayerId]: [...(prev[prayerId] || []), data[0]],
            }));
            setPrayers(prev =>
                prev.map(p => p.id === prayerId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)
            );
        }
        setCommentLoading(prev => ({ ...prev, [prayerId]: false }));
    }

    async function handleDeleteComment(commentId, prayerId) {
        const { error } = await supabase
            .from('prayer_comments')
            .delete()
            .eq('id', commentId);

        if (!error) {
            setComments(prev => ({
                ...prev,
                [prayerId]: (prev[prayerId] || []).filter(c => c.id !== commentId),
            }));
            setPrayers(prev =>
                prev.map(p => p.id === prayerId ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) } : p)
            );
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Энэ постыг устгах уу?')) return;

        const { error } = await supabase
            .from('prayers')
            .delete()
            .eq('id', id);

        if (error) {
            showMessage('Устгахад алдаа: ' + error.message, 'error');
        } else {
            showMessage('Пост устгагдлаа!');
            fetchPrayers();
        }
    }

    function renderContent(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="feed-inline-link">{part}</a>;
            }
            return part;
        });
    }

    const visibleComments = (prayerId) => {
        const all = comments[prayerId] || [];
        if (expandedComments.has(prayerId)) return all;
        return all.slice(-2);
    };

    return (
        <div className="app">
            <Header
                user={user}
                profile={profile}
                dateBarInfo={
                    <>
                        <span>🙏 Залбирал</span>
                    </>
                }
            />

            <main className="feed-container">
                <div className="feed-hero">
                    <h1 className="serif feed-title">🙏 Залбирал</h1>
                    <p className="feed-subtitle">
                        Бие биенийхээ төлөө залбирч, Бурханы хайрыг түгээцгээе
                    </p>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>{message.text}</div>
                )}

                {user ? (
                    <div className="feed-create-card">
                        <div className="feed-create-top">
                            <div className="comment-avatar">{(profile?.username || 'U').charAt(0).toUpperCase()}</div>
                            <div
                                className={`feed-create-input-placeholder ${postFormFocused ? 'hidden' : ''}`}
                                onClick={() => setPostFormFocused(true)}
                            >
                                Залбирлын хүсэлтээ бичээрэй, {profile?.username || 'User'}...
                            </div>
                        </div>

                        {postFormFocused && (
                            <form onSubmit={handleSubmit} className="feed-create-form">
                                <textarea
                                    placeholder="Залбирлын хүсэлт..."
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    className="feed-input feed-textarea"
                                    rows={4}
                                    autoFocus
                                />
                                {form.image_url && (
                                    <div className="feed-media-preview">
                                        <img src={form.image_url} alt="Preview" />
                                        <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="feed-media-remove">✕</button>
                                    </div>
                                )}
                                <div className="feed-create-actions">
                                    <div className="feed-create-media">
                                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                                        <button type="button" onClick={() => imageInputRef.current?.click()} className="feed-action-media-btn" disabled={uploading}>
                                            📸 Зураг
                                        </button>
                                    </div>
                                    <div className="feed-create-btns">
                                        <button type="button" onClick={() => setPostFormFocused(false)} className="feed-cancel-btn">Цуцлах</button>
                                        <button type="submit" className="feed-post-btn" disabled={submitLoading || uploading || !form.content.trim()}>
                                            {submitLoading ? 'Илгээж байна...' : 'Илгээх'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="feed-login-card">
                        <p>🙏 Залбирлын хүсэлт илгээхийн тулд нэвтэрнэ үү</p>
                        <Link to="/login" className="btn btn-primary btn-sm">🔑 Нэвтрэх</Link>
                    </div>
                )}

                {loading ? (
                    <div className="loading-container"><div className="loading-spinner"></div></div>
                ) : (
                    <div className="feed-list">
                        {prayers.map(p => (
                            <div key={p.id} className="feed-card">
                                <div className="feed-card-header">
                                    <div className="feed-avatar">{p.username.charAt(0).toUpperCase()}</div>
                                    <div className="feed-card-user">
                                        <span className="feed-card-username">{p.username}</span>
                                        <span className="feed-card-time">{timeAgo(p.created_at)}</span>
                                    </div>
                                    {user && user.id === p.user_id && (
                                        <button className="feed-menu-btn" onClick={() => handleDelete(p.id)}>🗑️</button>
                                    )}
                                </div>

                                <p className="feed-card-content">{renderContent(p.content)}</p>
                                {p.image_url && <div className="feed-card-media"><img src={p.image_url} alt="" className="feed-card-img" /></div>}

                                <div className="feed-counts">
                                    {p.likeCount > 0 && <span className="feed-like-count">🙏 {p.likeCount} хүн залбирч байна</span>}
                                    {p.commentCount > 0 && <span className="feed-comment-count">💬 {p.commentCount} сэтгэгдэл</span>}
                                </div>

                                <div className="feed-action-bar">
                                    <button onClick={() => handleLike(p.id)} className={`feed-action-btn ${userLikes.has(p.id) ? 'active' : ''}`}>
                                        {userLikes.has(p.id) ? '🙌' : '🙏'} Залбиръя
                                    </button>
                                    <button className="feed-action-btn" onClick={() => document.getElementById(`comment-input-${p.id}`)?.focus()}>
                                        💬 Сэтгэгдэл
                                    </button>
                                </div>

                                <div className="feed-comments">
                                    {visibleComments(p.id).map(c => (
                                        <div key={c.id} className="feed-comment">
                                            <div className="feed-comment-avatar">{c.username.charAt(0).toUpperCase()}</div>
                                            <div className="feed-comment-body">
                                                <div className="feed-comment-bubble">
                                                    <span className="feed-comment-name">{c.username}</span>
                                                    <span className="feed-comment-text">{c.content}</span>
                                                </div>
                                                <div className="feed-comment-meta">
                                                    <span>{timeAgo(c.created_at)}</span>
                                                    {user && user.id === c.user_id && (
                                                        <button className="feed-comment-delete" onClick={() => handleDeleteComment(c.id, p.id)}>Устгах</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {user && (
                                        <div className="feed-comment-input-row">
                                            <div className="feed-comment-input-wrap">
                                                <input
                                                    id={`comment-input-${p.id}`}
                                                    type="text"
                                                    placeholder="Амэн..."
                                                    value={commentInputs[p.id] || ''}
                                                    onChange={e => setCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                    onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit(p.id); }}
                                                    className="feed-comment-input"
                                                />
                                                <button onClick={() => handleCommentSubmit(p.id)} className="feed-comment-send">➤</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Prayers;
