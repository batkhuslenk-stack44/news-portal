import React from 'react';
import { NavLink } from 'react-router-dom';

function BottomNav() {
    return (
        <nav className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="nav-icon">🏠</span>
                <span className="nav-label">Мэдээ</span>
            </NavLink>
            <NavLink to="/songs" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="nav-icon">🎵</span>
                <span className="nav-label">Магтаал</span>
            </NavLink>
            <NavLink to="/prayers" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="nav-icon">🙏</span>
                <span className="nav-label">Залбирал</span>
            </NavLink>
            <NavLink to="/testimonies" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="nav-icon">💬</span>
                <span className="nav-label">Гэрчлэл</span>
            </NavLink>
            <NavLink to="/churches" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="nav-icon">🤝</span>
                <span className="nav-label">Цугларалт</span>
            </NavLink>
        </nav>
    );
}

export default BottomNav;
