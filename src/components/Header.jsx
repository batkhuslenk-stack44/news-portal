import React from 'react';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';

function Header({ user, profile, handleLogout, dateBarInfo }) {
    const currentDate = new Date().toLocaleDateString('mn-MN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header>
            <div className="container">
                <Link to="/" className="site-title" style={{ textDecoration: 'none', display: 'block' }}>
                    FAITH NEWS
                </Link>
                <div className="date-bar">
                    {dateBarInfo || (
                        <>
                            <span>{currentDate}</span>
                            <span>Хувилбар LXXIV — Дугаар 256</span>
                            <span>Монгол Улс, Улаанбаатар</span>
                        </>
                    )}
                </div>
                <nav className="desktop-only">
                    <ul className="nav-links">
                        <li><Link to="/churches">Сүм чуулган</Link></li>
                        <li><Link to="/testimonies">Гэрчлэл</Link></li>
                        <li><Link to="/prayers">Залбирал</Link></li>
                        <li><Link to="/songs">🎵 Магтаал дуу</Link></li>
                        <li><Link to="/audiobooks">📚 Сонсдог ном</Link></li>
                        <li><Link to="/admin" className="admin-link">Админ</Link></li>
                        {user ? (
                            <>
                                <li className="user-nav-item">
                                    <span className="user-avatar-small">{(profile?.username || 'U').charAt(0).toUpperCase()}</span>
                                    <span className="user-name-nav">{profile?.username || 'User'}</span>
                                </li>
                                {handleLogout && (
                                    <li><button onClick={handleLogout} className="btn btn-sm btn-secondary nav-logout-btn">Гарах</button></li>
                                )}
                            </>
                        ) : (
                            <>
                                <li><Link to="/login" className="btn btn-sm btn-primary">🔑 Нэвтрэх</Link></li>
                                <li><Link to="/register" className="btn btn-sm btn-secondary">📝 Бүртгүүлэх</Link></li>
                            </>
                        )}
                        <li><ThemeSwitcher /></li>
                    </ul>
                </nav>
                <div className="mobile-only" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    );
}

export default Header;
