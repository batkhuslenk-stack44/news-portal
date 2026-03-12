import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem('playerVolume')) || 0.8);
    const [playlist, setPlaylist] = useState([]);

    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
            }
        };

        const handleEnded = () => {
            playNext();
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [playlist, currentTrack]);

    useEffect(() => {
        localStorage.setItem('playerVolume', volume);
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const playTrack = (track, newPlaylist = null) => {
        if (newPlaylist) {
            setPlaylist(newPlaylist);
        }

        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }

        setCurrentTrack(track);
        setIsPlaying(true);

        audioRef.current.src = track.audio_url || track.url;
        audioRef.current.play().catch(err => console.error("Playback error:", err));
    };

    const togglePlay = () => {
        if (!currentTrack) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.error("Playback error:", err));
        }
        setIsPlaying(!isPlaying);
    };

    const playNext = () => {
        if (playlist.length === 0) return;
        const idx = playlist.findIndex(t => t.id === currentTrack?.id);
        if (idx !== -1 && idx < playlist.length - 1) {
            playTrack(playlist[idx + 1]);
        } else if (playlist.length > 0) {
            playTrack(playlist[0]);
        }
    };

    const playPrev = () => {
        if (playlist.length === 0) return;
        const idx = playlist.findIndex(t => t.id === currentTrack?.id);
        if (idx > 0) {
            playTrack(playlist[idx - 1]);
        } else if (playlist.length > 0) {
            playTrack(playlist[playlist.length - 1]);
        }
    };

    const seek = (percent) => {
        if (!audioRef.current.duration) return;
        audioRef.current.currentTime = (percent / 100) * audioRef.current.duration;
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            progress,
            currentTime,
            duration,
            volume,
            setVolume,
            playTrack,
            togglePlay,
            playNext,
            playPrev,
            seek,
            playlist
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
