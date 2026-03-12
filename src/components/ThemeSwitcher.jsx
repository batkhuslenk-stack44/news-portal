import React from 'react';
import { useTheme } from '../context/ThemeContext';

function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={`theme-toggle ${theme}`}
            onClick={toggleTheme}
            aria-label="Toggle Theme"
        >
            <div className="toggle-track">
                <div className="toggle-thumb">
                    <span className="toggle-icon">{theme === 'light' ? '🕊️' : '🦅'}</span>
                </div>
                <div className="stars-container">
                    <span className="star">⭐</span>
                    <span className="star">✨</span>
                    <span className="star">⭐</span>
                </div>
            </div>
        </button>
    );
}

export default ThemeSwitcher;
