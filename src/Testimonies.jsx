import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseAdmin } from './lib/supabase';
import Header from './components/Header';
import TestimonyCreateForm from './components/testimonies/TestimonyCreateForm';
import TestimonyCard from './components/testimonies/TestimonyCard';
import { toast } from 'react-toastify';
import ConfirmModal from './components/ConfirmModal';

function Testimonies() {
    const [testimonies, setTestimonies] = useState([]);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Interactions state
    const [userLikes, setUserLikes] = useState(new Set());
    const [comments, setComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [commentLoading, setCommentLoading] = useState({});
    const [activeMenu, setActiveMenu] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deletingComment, setDeletingComment] = useState(null);

    const isAdmin = localStorage.getItem('isAdmin') === 'true';

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
        const { data } = await supabase.from('profiles').select('username').eq('id', userId).single();
        setProfile(data);
    }

    async function fetchTestimonies() {
        setLoading(true);
        const { data, error } = await supabase.from('testimonies').select('*').order('created_at', { ascending: false });

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

            const allComments = {};
            for (const t of (data || [])) {
                const { data: cData } = await supabase.from('testimony_comments').select('*').eq('testimony_id', t.id).order('created_at', { ascending: true });
                allComments[t.id] = cData || [];
            }
            setComments(allComments);
        }
        setLoading(false);
    }

    async function fetchUserLikes(userId) {
        const { data } = await supabase.from('testimony_likes').select('testimony_id').eq('user_id', userId);
        if (data) {
            setUserLikes(new Set(data.map(l => l.testimony_id)));
        }
    }

    function showMessage(text, type = 'success') {
        if (type === 'error') toast.error(text);
        else toast.success(text);
    }

    const handleCreateTestimony = async (form) => {
        const username = profile?.username || user?.user_metadata?.username || 'User';
        const insertData = { ...form, user_id: user.id, username };
        if (!insertData.title) insertData.title = 'Пост';

        const { error } = await supabase.from('testimonies').insert([insertData]);

        if (error) {
            showMessage('Пост нэмэхэд алдаа: ' + error.message, 'error');
            return false;
        } else {
            showMessage('Пост амжилттай нийтлэгдлээ! ✅');
            fetchTestimonies();
            return true;
        }
    };

    async function handleLike(testimonyId) {
        if (!user) return showMessage('Лайк өгөхийн тулд нэвтэрнэ үү!', 'error');

        const isLiked = userLikes.has(testimonyId);
        if (isLiked) {
            const { error } = await supabase.from('testimony_likes').delete().eq('testimony_id', testimonyId).eq('user_id', user.id);
            if (!error) {
                setUserLikes(prev => { const newSet = new Set(prev); newSet.delete(testimonyId); return newSet; });
                setTestimonies(prev => prev.map(t => t.id === testimonyId ? { ...t, likeCount: t.likeCount - 1 } : t));
            }
        } else {
            const { error } = await supabase.from('testimony_likes').insert([{ testimony_id: testimonyId, user_id: user.id }]);
            if (!error) {
                setUserLikes(prev => new Set(prev).add(testimonyId));
                setTestimonies(prev => prev.map(t => t.id === testimonyId ? { ...t, likeCount: t.likeCount + 1 } : t));
            }
        }
    }

    async function handleCommentSubmit(testimonyId) {
        const content = (commentInputs[testimonyId] || '').trim();
        if (!content) return;
        if (!user) return showMessage('Сэтгэгдэл бичихийн тулд нэвтэрнэ үү!', 'error');

        setCommentLoading(prev => ({ ...prev, [testimonyId]: true }));
        const username = profile?.username || user?.user_metadata?.username || 'User';
        const { data, error } = await supabase
            .from('testimony_comments')
            .insert([{ testimony_id: testimonyId, user_id: user.id, username, content }])
            .select();

        if (error) {
            showMessage('Сэтгэгдэл нэмэхэд алдаа: ' + error.message, 'error');
        } else {
            setCommentInputs(prev => ({ ...prev, [testimonyId]: '' }));
            setComments(prev => ({ ...prev, [testimonyId]: [...(prev[testimonyId] || []), data[0]] }));
            setTestimonies(prev => prev.map(t => t.id === testimonyId ? { ...t, commentCount: (t.commentCount || 0) + 1 } : t));
        }
        setCommentLoading(prev => ({ ...prev, [testimonyId]: false }));
    }

    function handleDeleteCommentClick(commentId, testimonyId) {
        setDeletingComment({ commentId, testimonyId });
    }

    async function confirmDeleteComment() {
        if (!deletingComment) return;
        const { commentId, testimonyId } = deletingComment;
        setDeletingComment(null);

        const client = isAdmin ? supabaseAdmin : supabase;
        const { error } = await client.from('testimony_comments').delete().eq('id', commentId);
        if (!error) {
            setComments(prev => ({ ...prev, [testimonyId]: (prev[testimonyId] || []).filter(c => c.id !== commentId) }));
            setTestimonies(prev => prev.map(t => t.id === testimonyId ? { ...t, commentCount: Math.max(0, (t.commentCount || 0) - 1) } : t));
        }
    }

    function handleDeleteClick(id) {
        setDeletingId(id);
    }

    async function confirmDelete() {
        if (!deletingId) return;
        const id = deletingId;
        setDeletingId(null);
        
        const client = isAdmin ? supabaseAdmin : supabase;
        const { error } = await client.from('testimonies').delete().eq('id', id);
        if (error) {
            showMessage('Устгахад алдаа: ' + error.message, 'error');
        } else {
            showMessage('Пост устгагдлаа!');
            fetchTestimonies();
        }
    }

    return (
        <div className="app">
            <Header
                user={user}
                profile={profile}
                dateBarInfo={
                    <div className="date-bar">
                        <span>📖 Итгэлийн Гэрчлэл</span>
                    </div>
                }
            />

            <main className="feed-container">
                <div className="feed-hero">
                    <h1 className="serif feed-title">🕊️ Нийгэмлэг</h1>
                    <p className="feed-subtitle">
                        Итгэгчдийн нийгмийн сүлжээ — Бодлоо хуваалцаж, залбирч, бие биенээ дэмж
                    </p>
                </div>

                {user ? (
                    <TestimonyCreateForm
                        user={user}
                        profile={profile}
                        onSubmit={handleCreateTestimony}
                        showMessage={showMessage}
                    />
                ) : (
                    <div className="feed-login-card">
                        <p>✍️ Пост бичихийн тулд нэвтэрнэ үү</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <Link to="/login" className="btn btn-primary btn-sm">🔑 Нэвтрэх</Link>
                            <Link to="/register" className="btn btn-secondary btn-sm">📝 Бүртгүүлэх</Link>
                        </div>
                    </div>
                )}

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
                            <TestimonyCard
                                key={t.id}
                                testimony={t}
                                user={user}
                                profile={profile}
                                isAdmin={isAdmin}
                                activeMenu={activeMenu}
                                setActiveMenu={setActiveMenu}
                                onDelete={handleDeleteClick}
                                isLiked={userLikes.has(t.id)}
                                onLike={handleLike}
                                expandedComments={expandedComments}
                                setExpandedComments={setExpandedComments}
                                comments={comments[t.id]}
                                commentInput={commentInputs[t.id]}
                                onCommentInputChange={(id, val) => setCommentInputs(prev => ({ ...prev, [id]: val }))}
                                onCommentSubmit={handleCommentSubmit}
                                commentLoading={commentLoading[t.id]}
                                onDeleteComment={handleDeleteCommentClick}
                                showMessage={showMessage}
                            />
                        ))}
                    </div>
                )}
            </main>

            <footer>
                <div className="container">
                    <h2 className="site-title" style={{ fontSize: '2rem' }}>FAITH NEWS</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>© 2026 Христийн Мэдээ Төв. Бүх эрх хуулиар хамгаалагдсан.</p>
                </div>
            </footer>
            
            <ConfirmModal 
                isOpen={!!deletingId} 
                message="Энэ постыг устгах уу?" 
                onConfirm={confirmDelete} 
                onCancel={() => setDeletingId(null)} 
            />
            
            <ConfirmModal 
                isOpen={!!deletingComment} 
                message="Энэ сэтгэгдлийг устгах уу?" 
                onConfirm={confirmDeleteComment} 
                onCancel={() => setDeletingComment(null)} 
            />
        </div>
    );
}

export default Testimonies;
