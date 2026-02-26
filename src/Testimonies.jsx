import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabase';

function Testimonies() {
    const [testimonies, setTestimonies] = useState([]);
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
        fetchTestimonies();

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

        // Close menu on outside click
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

    async function fetchTestimonies() {
        setLoading(true);
        const { data, error } = await supabase
            .from('testimonies')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching testimonies:', error);
        } else {
            const testimoniesWithCounts = await Promise.all(
                (data || []).map(async (t) => {
                    const [likesRes, commentsRes] = await Promise.all([
                        supabase.from('testimony_likes').select('*', { count: 'exact', head: true }).eq('testimony_id', t.id),
                        supabase.from('testimony_comments').select('*', { count: 'exact', head: true }).eq('testimony_id', t.id),
                    ]);
                    return { ...t, likeCount: likesRes.count || 0, commentCount: commentsRes.count || 0 };
                })
            );
            setTestimonies(testimoniesWithCounts);

            // Fetch comments for all
            const allComments = {};
            for (const t of (data || [])) {
                const { data: cData } = await supabase
                    .from('testimony_comments')
                    .select('*')
                    .eq('testimony_id', t.id)
                    .order('created_at', { ascending: true });
                allComments[t.id] = cData || [];
            }
            setComments(allComments);
        }
        setLoading(false);
    }

    async function fetchUserLikes(userId) {
        const { data } = await supabase
            .from('testimony_likes')
            .select('testimony_id')
            .eq('user_id', userId);

        if (data) {
            setUserLikes(new Set(data.map(l => l.testimony_id)));
        }
    }

    function showMessage(text, type = 'success') {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }

    // ===== Relative Time =====
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

    // ===== File Upload =====
    async function handleFileUpload(file, type) {
        if (!file) return null;

        if (type === 'image') {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showMessage('Зөвхөн JPG, PNG, GIF, WEBP зураг оруулна уу!', 'error');
                return null;
            }
            if (file.size > 5 * 1024 * 1024) {
                showMessage('Зурагны хэмжээ 5MB-аас бага байх ёстой!', 'error');
                return null;
            }
        }

        if (type === 'video') {
            const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime', 'video/avi', 'video/x-msvideo'];
            if (!allowedTypes.includes(file.type)) {
                showMessage('Зөвхөн MP4, WEBM, MOV бичлэг оруулна уу!', 'error');
                return null;
            }
            if (file.size > 100 * 1024 * 1024) {
                showMessage('Бичлэгийн хэмжээ 100MB-аас бага байх ёстой!', 'error');
                return null;
            }
        }

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('news-images')
            .upload(fileName, file);

        if (error) {
            showMessage(`${type === 'image' ? 'Зураг' : 'Бичлэг'} upload хийхэд алдаа: ` + error.message, 'error');
            setUploading(false);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('news-images')
            .getPublicUrl(fileName);

        setUploading(false);
        return publicUrl;
    }

    async function handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        const url = await handleFileUpload(file, 'image');
        if (url) {
            setForm(prev => ({ ...prev, image_url: url }));
            showMessage('Зураг амжилттай upload хийгдлээ! 📸');
        }
    }

    async function handleVideoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        showMessage('Бичлэг upload хийж байна... Түр хүлээнэ үү 🎬');
        const url = await handleFileUpload(file, 'video');
        if (url) {
            setForm(prev => ({ ...prev, video_url: url }));
            showMessage('Бичлэг амжилттай upload хийгдлээ! 🎬');
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
            title: form.title.trim() || 'Пост',
            content: form.content.trim(),
        };
        if (form.image_url) insertData.image_url = form.image_url;
        if (form.video_url) insertData.video_url = form.video_url;
        if (form.link_url && form.link_url.trim()) insertData.link_url = form.link_url.trim();

        const { data, error } = await supabase
            .from('testimonies')
            .insert([insertData])
            .select();

        if (error) {
            showMessage('Пост нэмэхэд алдаа: ' + error.message, 'error');
        } else {
            showMessage('Пост амжилттай нийтлэгдлээ! ✅');
            setForm({ title: '', content: '', image_url: '', video_url: '', link_url: '' });
            setPostFormFocused(false);
            fetchTestimonies();
        }
        setSubmitLoading(false);
    }

    // ===== Like =====
    async function handleLike(testimonyId) {
        if (!user) {
            showMessage('Лайк өгөхийн тулд нэвтэрнэ үү!', 'error');
            return;
        }

        const isLiked = userLikes.has(testimonyId);

        if (isLiked) {
            const { error } = await supabase
                .from('testimony_likes')
                .delete()
                .eq('testimony_id', testimonyId)
                .eq('user_id', user.id);

            if (!error) {
                setUserLikes(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(testimonyId);
                    return newSet;
                });
                setTestimonies(prev =>
                    prev.map(t => t.id === testimonyId ? { ...t, likeCount: t.likeCount - 1 } : t)
                );
            }
        } else {
            const { error } = await supabase
                .from('testimony_likes')
                .insert([{ testimony_id: testimonyId, user_id: user.id }]);

            if (!error) {
                setUserLikes(prev => new Set(prev).add(testimonyId));
                setTestimonies(prev =>
                    prev.map(t => t.id === testimonyId ? { ...t, likeCount: t.likeCount + 1 } : t)
                );
            }
        }
    }

    // ===== Comments =====
    async function handleCommentSubmit(testimonyId) {
        const content = (commentInputs[testimonyId] || '').trim();
        if (!content) return;
        if (!user) {
            showMessage('Comment бичихийн тулд нэвтэрнэ үү!', 'error');
            return;
        }

        setCommentLoading(prev => ({ ...prev, [testimonyId]: true }));
        const username = profile?.username || user?.user_metadata?.username || 'User';

        const { data, error } = await supabase
            .from('testimony_comments')
            .insert([{
                testimony_id: testimonyId,
                user_id: user.id,
                username: username,
                content: content,
            }])
            .select();

        if (error) {
            showMessage('Comment нэмэхэд алдаа: ' + error.message, 'error');
        } else {
            setCommentInputs(prev => ({ ...prev, [testimonyId]: '' }));
            setComments(prev => ({
                ...prev,
                [testimonyId]: [...(prev[testimonyId] || []), data[0]],
            }));
            setTestimonies(prev =>
                prev.map(t => t.id === testimonyId ? { ...t, commentCount: (t.commentCount || 0) + 1 } : t)
            );
        }
        setCommentLoading(prev => ({ ...prev, [testimonyId]: false }));
    }

    async function handleDeleteComment(commentId, testimonyId) {
        const { error } = await supabase
            .from('testimony_comments')
            .delete()
            .eq('id', commentId);

        if (!error) {
            setComments(prev => ({
                ...prev,
                [testimonyId]: (prev[testimonyId] || []).filter(c => c.id !== commentId),
            }));
            setTestimonies(prev =>
                prev.map(t => t.id === testimonyId ? { ...t, commentCount: Math.max(0, (t.commentCount || 0) - 1) } : t)
            );
        }
    }

    // ===== Delete Post =====
    async function handleDelete(id) {
        if (!window.confirm('Энэ постыг устгах уу?')) return;

        const { error } = await supabase
            .from('testimonies')
            .delete()
            .eq('id', id);

        if (error) {
            showMessage('Устгахад алдаа: ' + error.message, 'error');
        } else {
            showMessage('Пост устгагдлаа!');
            fetchTestimonies();
        }
    }

    // Render links in content
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

    const visibleComments = (testimonyId) => {
        const all = comments[testimonyId] || [];
        if (expandedComments.has(testimonyId)) return all;
        return all.slice(-2);
    };

    return (
        <div className="app">
            {/* Header */}
            <header>
                <div className="container">
                    <Link to="/" className="site-title" style={{ textDecoration: 'none', display: 'block' }}>ИТГЭЛИЙН ЗАМ</Link>
                    <nav>
                        <ul className="nav-links">
                            <li><Link to="/">← Нүүр</Link></li>
                            {user ? (
                                <li>
                                    <span className="user-avatar-small">{(profile?.username || 'U').charAt(0).toUpperCase()}</span>
                                    <span className="user-name-nav" style={{ marginLeft: '0.3rem' }}>{profile?.username || 'User'}</span>
                                </li>
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

            <main className="feed-container">
                {/* Page Title */}
                <div className="feed-hero">
                    <h1 className="serif feed-title">🕊️ Нийгэмлэг</h1>
                    <p className="feed-subtitle">
                        Итгэгчдийн нийгмийн сүлжээ — Бодлоо хуваалцаж, залбирч, бие биенээ дэмж
                    </p>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>{message.text}</div>
                )}

                {/* Create Post Box - Facebook style */}
                {user ? (
                    <div className="feed-create-card">
                        <div className="feed-create-top">
                            <div className="comment-avatar">{(profile?.username || 'U').charAt(0).toUpperCase()}</div>
                            <div
                                className={`feed-create-input-placeholder ${postFormFocused ? 'hidden' : ''}`}
                                onClick={() => setPostFormFocused(true)}
                            >
                                Юу бодож байна, {profile?.username || 'User'}?
                            </div>
                        </div>

                        {postFormFocused && (
                            <form onSubmit={handleSubmit} className="feed-create-form">
                                <input
                                    type="text"
                                    placeholder="Гарчиг (заавал биш)"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="feed-input feed-input-title"
                                />
                                <textarea
                                    placeholder="Бодлоо бичээрэй..."
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    className="feed-input feed-textarea"
                                    rows={4}
                                    autoFocus
                                />

                                {/* Media Previews */}
                                {form.image_url && (
                                    <div className="feed-media-preview">
                                        <img src={form.image_url} alt="Preview" />
                                        <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="feed-media-remove">✕</button>
                                    </div>
                                )}
                                {form.video_url && (
                                    <div className="feed-media-preview">
                                        <video src={form.video_url} controls style={{ width: '100%', borderRadius: '8px' }} />
                                        <button type="button" onClick={() => setForm({ ...form, video_url: '' })} className="feed-media-remove">✕</button>
                                    </div>
                                )}

                                {uploading && (
                                    <div className="feed-uploading">
                                        <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                                        <span>Upload хийж байна...</span>
                                    </div>
                                )}

                                <input
                                    type="url"
                                    placeholder="🔗 Линк (заавал биш)"
                                    value={form.link_url}
                                    onChange={e => setForm({ ...form, link_url: e.target.value })}
                                    className="feed-input"
                                />

                                <div className="feed-create-actions">
                                    <div className="feed-create-media">
                                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                                        <button type="button" onClick={() => imageInputRef.current?.click()} className="feed-action-media-btn" disabled={uploading}>
                                            📸 Зураг
                                        </button>
                                        <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: 'none' }} />
                                        <button type="button" onClick={() => videoInputRef.current?.click()} className="feed-action-media-btn" disabled={uploading}>
                                            🎬 Бичлэг
                                        </button>
                                    </div>
                                    <div className="feed-create-btns">
                                        <button type="button" onClick={() => { setPostFormFocused(false); setForm({ title: '', content: '', image_url: '', video_url: '', link_url: '' }); }} className="feed-cancel-btn">
                                            Цуцлах
                                        </button>
                                        <button type="submit" className="feed-post-btn" disabled={submitLoading || uploading || !form.content.trim()}>
                                            {submitLoading ? 'Нийтэлж байна...' : 'Нийтлэх'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="feed-login-card">
                        <p>✍️ Пост бичихийн тулд нэвтэрнэ үү</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <Link to="/login" className="btn btn-primary btn-sm">🔑 Нэвтрэх</Link>
                            <Link to="/register" className="btn btn-secondary btn-sm">📝 Бүртгүүлэх</Link>
                        </div>
                    </div>
                )}

                {/* Feed Posts */}
                {loading ? (
                    <div className="loading-container" style={{ minHeight: '30vh' }}>
                        <div className="loading-spinner"></div>
                        <p>Ачааллаж байна...</p>
                    </div>
                ) : testimonies.length === 0 ? (
                    <div className="feed-empty">
                        <h2>Пост байхгүй байна</h2>
                        <p>Та эхний постоо бичээрэй! 🕊️</p>
                    </div>
                ) : (
                    <div className="feed-list">
                        {testimonies.map(t => (
                            <div key={t.id} className="feed-card">
                                {/* Post Header */}
                                <div className="feed-card-header">
                                    <div className="feed-avatar">{t.username.charAt(0).toUpperCase()}</div>
                                    <div className="feed-card-user">
                                        <span className="feed-card-username">{t.username}</span>
                                        <span className="feed-card-time">{timeAgo(t.created_at)}</span>
                                    </div>
                                    {user && user.id === t.user_id && (
                                        <div className="feed-menu-wrap" onClick={e => e.stopPropagation()}>
                                            <button
                                                className="feed-menu-btn"
                                                onClick={() => setActiveMenu(activeMenu === t.id ? null : t.id)}
                                            >
                                                ⵈ
                                            </button>
                                            {activeMenu === t.id && (
                                                <div className="feed-menu-dropdown">
                                                    <button onClick={() => { handleDelete(t.id); setActiveMenu(null); }}>
                                                        🗑️ Устгах
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Post Content */}
                                {t.title && t.title !== 'Пост' && (
                                    <h3 className="feed-card-title serif">{t.title}</h3>
                                )}
                                <p className="feed-card-content">{renderContent(t.content)}</p>

                                {/* Media */}
                                {t.image_url && (
                                    <div className="feed-card-media">
                                        <img src={t.image_url} alt="" className="feed-card-img" />
                                    </div>
                                )}
                                {t.video_url && (
                                    <div className="feed-card-media">
                                        <video src={t.video_url} controls className="feed-card-video" />
                                    </div>
                                )}
                                {t.link_url && (
                                    <a href={t.link_url} target="_blank" rel="noopener noreferrer" className="feed-card-link">
                                        🔗 {t.link_url.length > 50 ? t.link_url.substring(0, 50) + '...' : t.link_url}
                                    </a>
                                )}

                                {/* Like & Comment Counts */}
                                <div className="feed-counts">
                                    {t.likeCount > 0 && (
                                        <span className="feed-like-count">❤️ {t.likeCount}</span>
                                    )}
                                    {t.commentCount > 0 && (
                                        <span className="feed-comment-count"
                                            onClick={() => setExpandedComments(prev => {
                                                const s = new Set(prev);
                                                s.has(t.id) ? s.delete(t.id) : s.add(t.id);
                                                return s;
                                            })}
                                        >
                                            💬 {t.commentCount} сэтгэгдэл
                                        </span>
                                    )}
                                </div>

                                {/* Action Bar */}
                                <div className="feed-action-bar">
                                    <button
                                        onClick={() => handleLike(t.id)}
                                        className={`feed-action-btn ${userLikes.has(t.id) ? 'active' : ''}`}
                                    >
                                        {userLikes.has(t.id) ? '❤️' : '🤍'} Таалагдсан
                                    </button>
                                    <button
                                        className="feed-action-btn"
                                        onClick={() => {
                                            const el = document.getElementById(`comment-input-${t.id}`);
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
                                <div className="feed-comments">
                                    {(comments[t.id] || []).length > 2 && !expandedComments.has(t.id) && (
                                        <button
                                            className="feed-show-more-comments"
                                            onClick={() => setExpandedComments(prev => new Set(prev).add(t.id))}
                                        >
                                            Бүх {(comments[t.id] || []).length} сэтгэгдлийг үзэх
                                        </button>
                                    )}

                                    {visibleComments(t.id).map(c => (
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
                                                        <button className="feed-comment-delete" onClick={() => handleDeleteComment(c.id, t.id)}>Устгах</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Comment Input */}
                                    {user ? (
                                        <div className="feed-comment-input-row">
                                            <div className="feed-comment-avatar">{(profile?.username || 'U').charAt(0).toUpperCase()}</div>
                                            <div className="feed-comment-input-wrap">
                                                <input
                                                    id={`comment-input-${t.id}`}
                                                    type="text"
                                                    placeholder="Сэтгэгдэл бичих..."
                                                    value={commentInputs[t.id] || ''}
                                                    onChange={e => setCommentInputs(prev => ({ ...prev, [t.id]: e.target.value }))}
                                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(t.id); } }}
                                                    className="feed-comment-input"
                                                    disabled={commentLoading[t.id]}
                                                />
                                                <button
                                                    onClick={() => handleCommentSubmit(t.id)}
                                                    className="feed-comment-send"
                                                    disabled={!(commentInputs[t.id] || '').trim() || commentLoading[t.id]}
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
                            </div>
                        ))}
                    </div>
                )}
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

export default Testimonies;
