import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';

function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    function showMessage(text, type = 'success') {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            showMessage('Нэвтрэхэд алдаа: ' + error.message, 'error');
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

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username.trim(),
                },
            },
        });

        if (error) {
            showMessage('Бүртгүүлэхэд алдаа: ' + error.message, 'error');
        } else {
            showMessage('Амжилттай бүртгэгдлээ! ✅ Нэвтэрч байна...');
            setTimeout(() => navigate('/'), 1500);
        }
        setLoading(false);
    }

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
