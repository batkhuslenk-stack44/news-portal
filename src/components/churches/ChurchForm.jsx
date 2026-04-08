import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { toast } from 'react-toastify';

function ChurchForm({ initialData, onSubmit, onCancel, isSubmitting }) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        description: '',
        members_count: 0,
        activities: '',
        address: '',
        location_url: '',
        image_url: ''
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const result = await uploadToCloudinary(file, 'image');
            setFormData(prev => ({ ...prev, image_url: result.url }));
            toast.success('Зураг амжилттай хуулагдлаа! 📸');
        } catch (error) {
            toast.error('Зураг хуулахад алдаа: ' + error.message);
        } finally {
            setUploading(false);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
                <label>Арга хэмжээ / Цугларалтын нэр</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="form-group">
                <label>Танилцуулга</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div className="form-grid">
                <div className="form-group">
                    <label>Оролцох хүний тоо (багцаагаар)</label>
                    <input type="number" value={formData.members_count || ''} onChange={e => setFormData({ ...formData, members_count: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                    <label>Хаяг</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                </div>
            </div>
            <div className="form-group">
                <label>Төрөл (Таслалаар тусгаарлах)</label>
                <input type="text" value={formData.activities} onChange={e => setFormData({ ...formData, activities: e.target.value })} placeholder="Конференц, Залбирлын цугларалт, Семинар..." required />
            </div>
            <div className="form-group">
                <label>Google Maps URL (Заавал биш)</label>
                <input type="url" value={formData.location_url} onChange={e => setFormData({ ...formData, location_url: e.target.value })} />
            </div>
            <div className="form-group">
                <label>Зургийн URL</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input type="url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} style={{ flex: 1 }} />
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                        {uploading ? 'Түр хүлээнэ үү...' : '📸 Сонгох'}
                    </button>
                </div>
            </div>
            <div className="btn-group">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || uploading}>
                    {isSubmitting ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
                <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSubmitting}>
                    Цуцлах
                </button>
            </div>
        </form>
    );
}

export default ChurchForm;
