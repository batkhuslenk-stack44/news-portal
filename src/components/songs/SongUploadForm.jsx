import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '../../lib/cloudinary';

function SongUploadForm({ user, profile, onSubmit, onCancel, showMessage }) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: '',
        artist: '',
        category: 'Магтаал',
        lyrics: '',
        audio_url: '',
        audio_type: '',
    });

    async function handleFileUpload(file) {
        if (!file) return;

        const allowedAudio = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav'];
        const allowedVideo = ['video/mp4', 'video/webm', 'video/ogg'];
        const allAllowed = [...allowedAudio, ...allowedVideo];

        if (!allAllowed.includes(file.type)) {
            showMessage('Зөвхөн MP3, MP4, WAV, OGG файл оруулна уу!', 'error');
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            showMessage('Файлын хэмжээ 100MB-аас бага байх ёстой!', 'error');
            return;
        }

        const isVideo = allowedVideo.includes(file.type);
        setUploading(true);

        try {
            const result = await uploadToCloudinary(file, isVideo ? 'video' : 'auto');
            setForm({ ...form, audio_url: result.url, audio_type: isVideo ? 'video' : 'audio' });
            showMessage('Файл амжилттай хуулагдлаа! ☁️');
        } catch (error) {
            showMessage('Файл хуулахад алдаа: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    }

    function handleFileChange(e) {
        handleFileUpload(e.target.files[0]);
    }

    function handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
    }

    async function handleSubmitSong(e) {
        e.preventDefault();

        if (!form.title.trim()) {
            showMessage('Дууны нэр оруулна уу!', 'error');
            return;
        }
        if (!form.audio_url) {
            showMessage('Дуу файл оруулна уу!', 'error');
            return;
        }

        setUploading(true);
        const success = await onSubmit(form);
        setUploading(false);

        if (success) {
            setForm({ title: '', artist: '', category: 'Магтаал', lyrics: '', audio_url: '', audio_type: '' });
        }
    }

    return (
        <div className="song-upload-form">
            <h2 className="serif" style={{ marginBottom: '1.2rem', fontSize: '1.5rem' }}>🎵 Шинэ дуу нэмэх</h2>

            <form onSubmit={handleSubmitSong}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>🎤 Дууны нэр *</label>
                        <input
                            type="text"
                            placeholder="Жишээ: Бурханы хайр"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>🎙️ Дуучин / Хамтлаг</label>
                        <input
                            type="text"
                            placeholder={profile?.username || 'Нэр оруулна уу'}
                            value={form.artist}
                            onChange={e => setForm({ ...form, artist: e.target.value })}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>📂 Ангилал</label>
                    <select
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        className="form-input"
                    >
                        <option value="Магтаал">🙏 Магтаал</option>
                        <option value="Залбирал">🕊️ Залбирал</option>
                        <option value="Монгол магтаал">🇲🇳 Монгол магтаал</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>🎶 Дуу файл (MP3, MP4) *</label>
                    <div
                        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*,video/mp4"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        {uploading ? (
                            <div className="upload-progress">
                                <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                                <p>Файл хуулж байна...</p>
                            </div>
                        ) : form.audio_url ? (
                            <div className="upload-placeholder">
                                <span className="upload-icon">✅</span>
                                <p>Файл амжилттай оруулсан!</p>
                                <span className="upload-hint">{form.audio_type === 'video' ? '🎬 MP4 видео' : '🎵 MP3 аудио'}</span>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <span className="upload-icon">🎵</span>
                                <p>MP3/MP4 файл чирж оруулах эсвэл дарж сонгох</p>
                                <span className="upload-hint">MP3, MP4, WAV, OGG • 100MB хүртэл</span>
                            </div>
                        )}
                    </div>

                    {form.audio_url && (
                        <button
                            type="button"
                            className="remove-image-btn"
                            style={{ marginTop: '0.5rem', borderRadius: '8px' }}
                            onClick={() => setForm({ ...form, audio_url: '', audio_type: '' })}
                        >
                            ✕ Файл хасах
                        </button>
                    )}
                </div>

                <div className="form-group">
                    <label>🔗 Эсвэл URL оруулах</label>
                    <input
                        type="url"
                        placeholder="https://example.com/song.mp3"
                        value={form.audio_url}
                        onChange={e => setForm({ ...form, audio_url: e.target.value, audio_type: e.target.value.includes('.mp4') ? 'video' : 'audio' })}
                        className="form-input"
                        disabled={uploading}
                    />
                </div>

                <div className="form-group">
                    <label>📝 Дууны үг (заавал биш)</label>
                    <textarea
                        placeholder="Дууны үгийг энд бичнэ үү..."
                        value={form.lyrics}
                        onChange={e => setForm({ ...form, lyrics: e.target.value })}
                        className="form-input form-textarea"
                        rows={8}
                        style={{ minHeight: '160px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                        {uploading ? 'Хадгалж байна...' : '🎵 Хадгалах'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={uploading}>
                        Цуцлах
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SongUploadForm;
