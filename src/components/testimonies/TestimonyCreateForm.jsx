import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '../../lib/cloudinary';

function TestimonyCreateForm({ user, profile, onSubmit, showMessage }) {
    const [form, setForm] = useState({ title: '', content: '', image_url: '', video_url: '', link_url: '' });
    const [postFormFocused, setPostFormFocused] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    async function handleFileUpload(file, type) {
        if (!file) return null;

        if (type === 'image') {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showMessage('Зөвхөн JPG, PNG, GIF, WEBP зураг оруулна уу!', 'error');
                return null;
            }
        }

        if (type === 'video') {
            const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime', 'video/avi', 'video/x-msvideo'];
            if (!allowedTypes.includes(file.type)) {
                showMessage('Зөвхөн MP4, WEBM, MOV бичлэг оруулна уу!', 'error');
                return null;
            }
        }

        setUploading(true);
        try {
            const result = await uploadToCloudinary(file, type === 'video' ? 'video' : 'auto');
            setUploading(false);
            return result.url;
        } catch (error) {
            showMessage(`${type === 'image' ? 'Зураг' : 'Бичлэг'} хуулахад алдаа: ` + error.message, 'error');
            setUploading(false);
            return null;
        }
    }

    async function handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        const url = await handleFileUpload(file, 'image');
        if (url) {
            setForm(prev => ({ ...prev, image_url: url }));
            showMessage('Зураг амжилттай хуулагдлаа! 📸');
        }
    }

    async function handleVideoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        showMessage('Бичлэг хуулж байна... Түр хүлээнэ үү 🎬');
        const url = await handleFileUpload(file, 'video');
        if (url) {
            setForm(prev => ({ ...prev, video_url: url }));
            showMessage('Бичлэг амжилттай хуулагдлаа! 🎬');
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.content.trim()) {
            showMessage('Агуулга бичнэ үү!', 'error');
            return;
        }

        if (!user) {
            showMessage('Нэвтэрсэн байх шаардлагатай!', 'error');
            return;
        }

        setSubmitLoading(true);
        const success = await onSubmit(form);
        setSubmitLoading(false);
        
        if (success) {
            setForm({ title: '', content: '', image_url: '', video_url: '', link_url: '' });
            setPostFormFocused(false);
        }
    }

    return (
        <div className="feed-create-card">
            <div className="feed-create-top">
                <div className="comment-avatar">{(profile?.username || 'U').charAt(0).toUpperCase()}</div>
                <div
                    className={`feed-create-input-placeholder ${postFormFocused ? 'hidden' : ''}`}
                    onClick={() => setPostFormFocused(true)}
                >
                    Юу бодож байна, {profile?.username || 'User'}?
                </div>
            </div>

            {postFormFocused && (
                <form onSubmit={handleSubmit} className="feed-create-form">
                    <input
                        type="text"
                        placeholder="Гарчиг (заавал биш)"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="feed-input feed-input-title"
                    />
                    <textarea
                        placeholder="Бодлоо бичээрэй..."
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        className="feed-input feed-textarea"
                        rows={4}
                        autoFocus
                    />

                    {form.image_url && (
                        <div className="feed-media-preview">
                            <img src={form.image_url} alt="Preview" />
                            <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="feed-media-remove">✕</button>
                        </div>
                    )}
                    {form.video_url && (
                        <div className="feed-media-preview">
                            <video src={form.video_url} controls style={{ width: '100%', borderRadius: '8px' }} />
                            <button type="button" onClick={() => setForm({ ...form, video_url: '' })} className="feed-media-remove">✕</button>
                        </div>
                    )}

                    {uploading && (
                        <div className="feed-uploading">
                            <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                            <span>Upload хийж байна...</span>
                        </div>
                    )}

                    <input
                        type="url"
                        placeholder="🔗 Линк (заавал биш)"
                        value={form.link_url}
                        onChange={e => setForm({ ...form, link_url: e.target.value })}
                        className="feed-input"
                    />

                    <div className="feed-create-actions">
                        <div className="feed-create-media">
                            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                            <button type="button" onClick={() => imageInputRef.current?.click()} className="feed-action-media-btn" disabled={uploading}>
                                📸 Зураг
                            </button>
                            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: 'none' }} />
                            <button type="button" onClick={() => videoInputRef.current?.click()} className="feed-action-media-btn" disabled={uploading}>
                                🎬 Бичлэг
                            </button>
                        </div>
                        <div className="feed-create-btns">
                            <button type="button" onClick={() => { 
                                setPostFormFocused(false); 
                                setForm({ title: '', content: '', image_url: '', video_url: '', link_url: '' }); 
                            }} className="feed-cancel-btn">
                                Цуцлах
                            </button>
                            <button type="submit" className="feed-post-btn" disabled={submitLoading || uploading || !form.content.trim()}>
                                {submitLoading ? 'Нийтэлж байна...' : 'Нийтлэх'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

export default TestimonyCreateForm;
