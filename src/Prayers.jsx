import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseAdmin } from './lib/supabase';
import Header from './components/Header';
import PrayerCreateForm from './components/prayers/PrayerCreateForm';
import PrayerCard from './components/prayers/PrayerCard';
import { toast } from 'react-toastify';

function Prayers() {
    const [prayers, setPrayers] = useState([]);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Interactions state
    const [userLikes, setUserLikes] = useState(new Set());
    const [comments, setComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [expandedComments, setExpandedComments] = useState(new Set());

    const isAdmin = localStorage.getItem('isAdmin') === 'true';

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

        return () => subscription.unsubscribe();
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
        if (type === 'error') toast.error(text);
        else toast.success(text);
    }

    const handleCreatePrayer = async (form) => {
        const username = profile?.username || user?.user_metadata?.username || 'User';
        const insertData = { ...form, user_id: user.id, username };
        if (!insertData.title) insertData.title = 'Залбирал';

        const { error } = await supabase.from('prayers').insert([insertData]);

        if (error) {
            showMessage('Залбирал нэмэхэд алдаа: ' + error.message, 'error');
            return false;
        } else {
            showMessage('Залбирал амжилттай нийтлэгдлээ! 🙏');
            fetchPrayers();
            return true;
        }
    };

    async function handleLike(prayerId) {
        if (!user) return showMessage('Лайк өгөхийн тулд нэвтэрнэ үү!', 'error');

        const isLiked = userLikes.has(prayerId);
        if (isLiked) {
            const { error } = await supabase.from('prayer_likes').delete().eq('prayer_id', prayerId).eq('user_id', user.id);
            if (!error) {
                setUserLikes(prev => { const newSet = new Set(prev); newSet.delete(prayerId); return newSet; });
                setPrayers(prev => prev.map(p => p.id === prayerId ? { ...p, likeCount: p.likeCount - 1 } : p));
            }
        } else {
            const { error } = await supabase.from('prayer_likes').insert([{ prayer_id: prayerId, user_id: user.id }]);
            if (!error) {
                setUserLikes(prev => new Set(prev).add(prayerId));
                setPrayers(prev => prev.map(p => p.id === prayerId ? { ...p, likeCount: p.likeCount + 1 } : p));
            }
        }
    }

    async function handleCommentSubmit(prayerId) {
        const content = (commentInputs[prayerId] || '').trim();
        if (!content) return;
        if (!user) return showMessage('Сэтгэгдэл бичихийн тулд нэвтэрнэ үү!', 'error');

        const username = profile?.username || user?.user_metadata?.username || 'User';
        const { data, error } = await supabase
            .from('prayer_comments')
            .insert([{ prayer_id: prayerId, user_id: user.id, username, content }])
            .select();

        if (error) {
            showMessage('Сэтгэгдэл нэмэхэд алдаа: ' + error.message, 'error');
        } else {
            setCommentInputs(prev => ({ ...prev, [prayerId]: '' }));
            setComments(prev => ({ ...prev, [prayerId]: [...(prev[prayerId] || []), data[0]] }));
            setPrayers(prev => prev.map(p => p.id === prayerId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
        }
    }

    async function handleDeleteComment(commentId, prayerId) {
        const client = isAdmin ? supabaseAdmin : supabase;
        const { error } = await client.from('prayer_comments').delete().eq('id', commentId);
        if (!error) {
            setComments(prev => ({ ...prev, [prayerId]: (prev[prayerId] || []).filter(c => c.id !== commentId) }));
            setPrayers(prev => prev.map(p => p.id === prayerId ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) } : p));
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Энэ постыг устгах уу?')) return;
        const client = isAdmin ? supabaseAdmin : supabase;
        const { error } = await client.from('prayers').delete().eq('id', id);
        if (error) {
            showMessage('Устгахад алдаа: ' + error.message, 'error');
        } else {
            showMessage('Пост устгагдлаа!');
            fetchPrayers();
        }
    }

    return (
        <div className="app">
            <Header user={user} profile={profile} dateBarInfo={<span>🙏 Залбирал</span>} />

            <main className="feed-container">
                <div className="feed-hero">
                    <h1 className="serif feed-title">🙏 Залбирал</h1>
                    <p className="feed-subtitle">Бие биенийхээ төлөө залбирч, Бурханы хайрыг түгээцгээе</p>
                </div>

                {user ? (
                    <PrayerCreateForm 
                        user={user} 
                        profile={profile} 
                        onSubmit={handleCreatePrayer} 
                        showMessage={showMessage} 
                    />
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
                            <PrayerCard 
                                key={p.id}
                                prayer={p}
                                user={user}
                                isAdmin={isAdmin}
                                isLiked={userLikes.has(p.id)}
                                onLike={handleLike}
                                onDelete={handleDelete}
                                comments={comments[p.id]}
                                expandedComments={expandedComments}
                                onCommentSubmit={handleCommentSubmit}
                                onCommentDelete={handleDeleteComment}
                                commentInput={commentInputs[p.id]}
                                onCommentInputChange={(id, val) => setCommentInputs(prev => ({ ...prev, [id]: val }))}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Prayers;
