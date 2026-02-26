import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';

function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    const isLogin = location.pathname === '/login';
    const isReset = location.pathname === '/reset-password';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showForgot, setShowForgot] = useState(false);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);

    useEffect(() => {
        // Listen for PASSWORD_RECOVERY event (when user clicks reset link in email)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryMode(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    function showMessage(text, type = 'success') {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 7000);
    }

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            let msg = error.message;
            if (msg.includes('Invalid login')) msg = 'Имэйл эсвэл нууц үг буруу байна!';
            else if (msg.includes('Email not confirmed')) msg = 'Имэйл баталгаажаагүй байна. Supabase Dashboard → Authentication → Providers → Email → "Confirm email" OFF болго!';
            showMessage(msg, 'error');
        } else {
            showMessage('Амжилттай нэвтэрлээ! ✅');
            setTimeout(() => navigate('/'), 1000);
        }
        setLoading(false);
    }

    async function handleRegister(e) {
        e.preventDefault();

        if (!username.trim()) {
            showMessage('Хэрэглэгчийн нэр оруулна уу!', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('Нууц үг 6-аас дээш тэмдэгт байх ёстой!', 'error');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username.trim(),
                },
                emailRedirectTo: window.location.origin + '/news-portal/',
            },
        });

        if (error) {
            let msg = error.message;
            if (msg.includes('already registered')) msg = 'Энэ имэйл аль хэдийн бүртгэлтэй байна!';
            else if (msg.includes('valid email')) msg = 'Зөв имэйл хаяг оруулна уу!';
            showMessage('Алдаа: ' + msg, 'error');
        } else if (data?.user && !data.session) {
            showMessage('Бүртгэл амжилттай! Имэйлээ шалгаж баталгаажуулна уу.', 'error');
        } else {
            showMessage('Амжилттай бүртгэгдлээ! ✅ Нэвтэрч байна...');
            setTimeout(() => navigate('/'), 1500);
        }
        setLoading(false);
    }

    async function handleForgotPassword(e) {
        e.preventDefault();
        if (!email.trim()) {
            showMessage('Имэйл хаягаа оруулна уу!', 'error');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/news-portal/reset-password',
        });

        if (error) {
            let msg = error.message;
            if (msg.includes('rate limit')) msg = 'Хэт олон оролдлого! Түр хүлээнэ үү.';
            showMessage('Алдаа: ' + msg, 'error');
        } else {
            showMessage('📧 Нууц үг сэргээх линк таны имэйл рүү илгээгдлээ! Имэйлээ шалгана уу.', 'success');
        }
        setLoading(false);
    }

    async function handleUpdatePassword(e) {
        e.preventDefault();
        if (newPassword.length < 6) {
            showMessage('Нууц үг 6-аас дээш тэмдэгт байх ёстой!', 'error');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            showMessage('Алдаа: ' + error.message, 'error');
        } else {
            showMessage('Нууц үг амжилттай солигдлоо! ✅');
            setIsRecoveryMode(false);
            setTimeout(() => navigate('/'), 1500);
        }
        setLoading(false);
    }

    // ===== Password Recovery Mode (from email link) =====
    if (isRecoveryMode || isReset) {
        return (
            <div className="app">
                <div className="auth-page">
                    <div className="auth-card">
                        <Link to="/" className="auth-logo serif">ИТГЭЛИЙН ЗАМ</Link>

                        <h1 className="serif">🔒 Шинэ нууц үг</h1>
                        <p className="auth-subtitle">Шинэ нууц үгээ оруулна уу</p>

                        {message.text && (
                            <div className={`message message-${message.type}`}>{message.text}</div>
                        )}

                        <form onSubmit={handleUpdatePassword}>
                            <div className="form-group">
                                <label>Шинэ нууц үг</label>
                                <input
                                    type="password"
                                    placeholder="6+ тэмдэгт"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="form-input"
                                    required
                                    minLength={6}
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? 'Түр хүлээнэ үү...' : '🔒 Нууц үг солих'}
                            </button>
                        </form>

                        <Link to="/" className="back-link">← Нүүр хуудас руу буцах</Link>
                    </div>
                </div>
            </div>
        );
    }

    // ===== Forgot Password View =====
    if (showForgot) {
        return (
            <div className="app">
                <div className="auth-page">
                    <div className="auth-card">
                        <Link to="/" className="auth-logo serif">ИТГЭЛИЙН ЗАМ</Link>

                        <h1 className="serif">🔄 Нууц үг сэргээх</h1>
                        <p className="auth-subtitle">Бүртгэлтэй имэйл хаягаа оруулна уу</p>

                        {message.text && (
                            <div className={`message message-${message.type}`}>{message.text}</div>
                        )}

                        <form onSubmit={handleForgotPassword}>
                            <div className="form-group">
                                <label>Имэйл</label>
                                <input
                                    type="email"
                                    placeholder="example@mail.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="form-input"
                                    required
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? 'Илгээж байна...' : '📧 Сэргээх линк илгээх'}
                            </button>
                        </form>

                        <div className="auth-switch">
                            <p>
                                <button
                                    onClick={() => setShowForgot(false)}
                                    className="forgot-link"
                                >
                                    ← Нэвтрэх хуудас руу буцах
                                </button>
                            </p>
                        </div>

                        <Link to="/" className="back-link">← Нүүр хуудас руу буцах</Link>
                    </div>
                </div>
            </div>
        );
    }

    // ===== Login / Register View =====
    return (
        <div className="app">
            <div className="auth-page">
                <div className="auth-card">
                    <Link to="/" className="auth-logo serif">ИТГЭЛИЙН ЗАМ</Link>

                    <h1 className="serif">
                        {isLogin ? '🔑 Нэвтрэх' : '📝 Бүртгүүлэх'}
                    </h1>
                    <p className="auth-subtitle">
                        {isLogin
                            ? 'Имэйл, нууц үгээ оруулна уу'
                            : 'Шинэ хаяг үүсгэх'}
                    </p>

                    {message.text && (
                        <div className={`message message-${message.type}`}>{message.text}</div>
                    )}

                    <form onSubmit={isLogin ? handleLogin : handleRegister}>
                        {!isLogin && (
                            <div className="form-group">
                                <label>Хэрэглэгчийн нэр</label>
                                <input
                                    type="text"
                                    placeholder="Жишээ: Батхүслэн"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="form-input"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Имэйл</label>
                            <input
                                type="email"
                                placeholder="example@mail.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="form-input"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Нууц үг</label>
                            <input
                                type="password"
                                placeholder={isLogin ? 'Нууц үг' : '6+ тэмдэгт'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="form-input"
                                required
                                minLength={6}
                            />
                        </div>

                        {isLogin && (
                            <div className="forgot-password-row">
                                <button
                                    type="button"
                                    onClick={() => setShowForgot(true)}
                                    className="forgot-link"
                                >
                                    Нууц үг мартсан уу?
                                </button>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading
                                ? 'Түр хүлээнэ үү...'
                                : isLogin ? '🔑 Нэвтрэх' : '📝 Бүртгүүлэх'}
                        </button>
                    </form>

                    <div className="auth-switch">
                        {isLogin ? (
                            <p>Хаяг байхгүй юу? <Link to="/register">Бүртгүүлэх →</Link></p>
                        ) : (
                            <p>Хаяг байгаа юу? <Link to="/login">Нэвтрэх →</Link></p>
                        )}
                    </div>

                    <Link to="/" className="back-link">← Нүүр хуудас руу буцах</Link>
                </div>
            </div>
        </div>
    );
}

export default Auth;
