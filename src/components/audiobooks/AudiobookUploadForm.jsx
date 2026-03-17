import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '../../lib/cloudinary';

function AudiobookUploadForm({ user, profile, onSubmit, onCancel, showMessage }) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: '',
        author: '',
        category: 'Библи',
        description: '',
        audio_url: '',
        link_url: '',
        cover_image: '',
    });

    async function handleFileUpload(file) {
        if (!file) return;
        const allowed = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/wav', 'video/mp4'];
        if (!allowed.includes(file.type)) {
            showMessage('Зөвхөн MP3, MP4, WAV файл оруулна уу!', 'error'); 
            return;
        }
        if (file.size > 200 * 1024 * 1024) {
            showMessage('Файлын хэмжээ 200MB-аас бага байх ёстой!', 'error'); 
            return;
        }

        setUploading(true);
        try {
            const result = await uploadToCloudinary(file, 'auto');
            setForm({ ...form, audio_url: result.url });
            showMessage('Файл амжилттай хуулагдлаа! ☁️');
        } catch (error) {
            showMessage('Файл хуулахад алдаа: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
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

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.title.trim()) { 
            showMessage('Номын нэр оруулна уу!', 'error'); 
            return; 
        }
        if (!form.audio_url && !form.link_url) { 
            showMessage('Аудио файл эсвэл линк оруулна уу!', 'error'); 
            return; 
        }

        setUploading(true);
        const success = await onSubmit(form);
        setUploading(false);

        if (success) {
            setForm({ title: '', author: '', category: 'Библи', description: '', audio_url: '', link_url: '', cover_image: '' });
        }
    }

    return (
        <div className="audiobook-form">
            <h2 className="serif" style={{ marginBottom: '1.2rem', fontSize: '1.5rem' }}>📖 Шинэ ном нэмэх</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>📖 Номын нэр *</label>
                        <input type="text" placeholder="Жишээ: Библийн түүхүүд" value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label>✍️ Зохиогч</label>
                        <input type="text" placeholder={profile?.username || 'Нэр'} value={form.author}
                            onChange={e => setForm({ ...form, author: e.target.value })} className="form-input" />
                    </div>
                </div>

                <div className="form-group">
                    <label>📂 Ангилал</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="form-input">
                        <option value="Библи">📖 Библи</option>
                        <option value="Номлол">🎤 Номлол</option>
                        <option value="Гэрчлэл">✝️ Гэрчлэл</option>
                        <option value="Сургаал">📝 Сургаал</option>
                        <option value="Залбирал">🕊️ Залбирал</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>🎧 Аудио файл (MP3)</label>
                    <div className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                        onClick={() => !uploading && fileInputRef.current?.click()}>
                        <input ref={fileInputRef} type="file" accept="audio/*" onChange={e => handleFileUpload(e.target.files[0])} style={{ display: 'none' }} />
                        {uploading ? (
                            <div className="upload-progress">
                                <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
                                <p>Хуулж байна...</p>
                            </div>
                        ) : form.audio_url ? (
                            <div className="upload-placeholder">
                                <span className="upload-icon">✅</span>
                                <p>Файл оруулсан!</p>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <span className="upload-icon">🎧</span>
                                <p>MP3 файл чирж оруулах эсвэл дарж сонгох</p>
                                <span className="upload-hint">MP3, MP4, WAV • 200MB хүртэл</span>
                            </div>
                        )}
                    </div>
                    {form.audio_url && (
                        <button type="button" className="remove-image-btn" style={{ marginTop: '0.5rem', borderRadius: '8px' }}
                            onClick={() => setForm({ ...form, audio_url: '' })}>✕ Файл хасах</button>
                    )}
                </div>

                <div className="form-group">
                    <label>🔗 Эсвэл линк оруулах</label>
                    <input type="url" placeholder="https://example.com/audiobook.mp3" value={form.link_url}
                        onChange={e => setForm({ ...form, link_url: e.target.value })} className="form-input" />
                </div>

                <div className="form-group">
                    <label>📝 Тайлбар / Товч агуулга</label>
                    <textarea placeholder="Номын товч агуулга..." value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="form-input form-textarea" rows={4} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                        {uploading ? 'Хадгалж байна...' : '📚 Хадгалах'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={uploading}>Цуцлах</button>
                </div>
            </form>
        </div>
    );
}

export default AudiobookUploadForm;
