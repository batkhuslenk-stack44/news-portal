import React, { useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

function GlobalPlayer() {
    const {
        currentTrack,
        isPlaying,
        togglePlay,
        playNext,
        playPrev,
        progress,
        currentTime,
        duration,
        volume,
        setVolume,
        seek
    } = usePlayer();

    const progressRef = useRef(null);

    if (!currentTrack) return null;

    const formatTime = (sec) => {
        if (!sec || isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e) => {
        const bar = progressRef.current;
        const rect = bar.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        seek(percent);
    };

    return (
        <div className="player-bar global-player-bar">
            <div className="player-bar-inner">
                {/* Song Info */}
                <div className="player-song-info">
                    <div className="player-cover">
                        {currentTrack.cover_image ? (
                            <img src={currentTrack.cover_image} alt="" />
                        ) : (
                            <div className="player-cover-placeholder">
                                {currentTrack.audio_type === 'video' ? '🎬' : '🎵'}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="player-title">{currentTrack.title}</p>
                        <p className="player-artist">{currentTrack.artist || 'Unknown'}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="player-controls">
                    <button className="player-btn" onClick={playPrev}>⏮</button>
                    <button className="player-btn player-btn-main" onClick={togglePlay}>
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button className="player-btn" onClick={playNext}>⏭</button>
                </div>

                {/* Progress */}
                <div className="player-progress-section">
                    <span className="player-time">{formatTime(currentTime)}</span>
                    <div
                        className="player-progress-bar"
                        ref={progressRef}
                        onClick={handleProgressClick}
                    >
                        <div
                            className="player-progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="player-time">{formatTime(duration)}</span>
                </div>

                {/* Volume */}
                <div className="player-volume">
                    <span className="volume-icon">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="volume-slider"
                    />
                </div>
            </div>
        </div>
    );
}

export default GlobalPlayer;
