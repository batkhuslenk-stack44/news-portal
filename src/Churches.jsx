import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import ChurchList from './components/churches/ChurchList';
import ChurchDetail from './components/churches/ChurchDetail';
import ChurchForm from './components/churches/ChurchForm';
import ChurchNewsForm from './components/churches/ChurchNewsForm';
import { toast } from 'react-toastify';

function Churches() {
    const [churches, setChurches] = useState([]);
    const [selectedChurch, setSelectedChurch] = useState(null);
    const [churchNews, setChurchNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    
    // View states
    const [showRegForm, setShowRegForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showNewsForm, setShowNewsForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchChurches();
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            fetchProfile(user.id);
        }
    }

    async function fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', userId)
                .single();
            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err.message);
        }
    }

    async function fetchChurches() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('churches')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setChurches(data || []);
        } catch (err) {
            console.error('Error fetching churches:', err.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchChurchNews(churchId) {
        try {
            const { data, error } = await supabase
                .from('church_news')
                .select('*')
                .eq('church_id', churchId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setChurchNews(data || []);
        } catch (err) {
            console.error('Error fetching news:', err.message);
        }
    }

    const handleSelectChurch = (church) => {
        setSelectedChurch(church);
        fetchChurchNews(church.id);
    };

    const handleRegister = async (formData) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('churches')
                .insert([{ ...formData, owner_id: user.id }])
                .select();
            if (error) throw error;
            setChurches([data[0], ...churches]);
            setShowRegForm(false);
            toast.success('Сүм амжилттай бүртгэгдлээ! ⛪');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (formData) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('churches')
                .update(formData)
                .eq('id', selectedChurch.id)
                .select();
            if (error) throw error;
            setChurches(churches.map(c => c.id === selectedChurch.id ? data[0] : c));
            setSelectedChurch(data[0]);
            setIsEditing(false);
            toast.success('Мэдээлэл шинэчлэгдлээ! ✅');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePostNews = async (newsForm) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('church_news')
                .insert([{ ...newsForm, church_id: selectedChurch.id }])
                .select();
            if (error) throw error;
            setChurchNews([data[0], ...churchNews]);
            setShowNewsForm(false);
            toast.success('Шинэ мэдээ нийтлэгдлээ! 📢');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

    return (
        <div className="app">
            <Header
                user={user}
                profile={profile}
                handleLogout={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    setProfile(null);
                }}
                dateBarInfo={<span>💒 Сүм чуулган</span>}
            />

            <main className="container">
                {!selectedChurch && !showRegForm && (
                    <ChurchList 
                        churches={churches} 
                        onSelectChurch={handleSelectChurch} 
                        user={user}
                        onRegisterClick={() => setShowRegForm(true)}
                    />
                )}

                {showRegForm && (
                    <section className="admin-form-container glass">
                        <h2 className="serif">Сүм бүртгүүлэх</h2>
                        <ChurchForm 
                            onSubmit={handleRegister} 
                            onCancel={() => setShowRegForm(false)} 
                            isSubmitting={isSubmitting}
                        />
                    </section>
                )}

                {selectedChurch && !showRegForm && (
                    <>
                        <ChurchDetail 
                            church={selectedChurch}
                            churchNews={churchNews}
                            user={user}
                            onBack={() => setSelectedChurch(null)}
                            onEditClick={() => setIsEditing(true)}
                            onAddNewsClick={() => setShowNewsForm(true)}
                        />

                        {isEditing && (
                            <div className="modal-overlay">
                                <div className="modal-content glass">
                                    <h3>Мэдээлэл засах</h3>
                                    <ChurchForm 
                                        initialData={selectedChurch}
                                        onSubmit={handleUpdate} 
                                        onCancel={() => setIsEditing(false)}
                                        isSubmitting={isSubmitting}
                                    />
                                </div>
                            </div>
                        )}

                        {showNewsForm && (
                            <div className="modal-overlay">
                                <div className="modal-content glass">
                                    <h3>Шинэ мэдээ оруулах</h3>
                                    <ChurchNewsForm 
                                        onSubmit={handlePostNews}
                                        onCancel={() => setShowNewsForm(false)}
                                        isSubmitting={isSubmitting}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <footer>
                <div className="container">
                    <p>© 2026 FAITH NEWS. Сүм чуулганы нэгдсэн мэдээллийн сан.</p>
                </div>
            </footer>
        </div>
    );
}

export default Churches;
