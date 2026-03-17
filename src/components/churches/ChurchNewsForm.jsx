import React, { useState } from 'react';

function ChurchNewsForm({ onSubmit, onCancel, isSubmitting }) {
    const [newsForm, setNewsForm] = useState({ title: '', content: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(newsForm);
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
                <label>Гарчиг</label>
                <input 
                    type="text" 
                    value={newsForm.title} 
                    onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} 
                    required 
                />
            </div>
            <div className="form-group">
                <label>Агуулга</label>
                <textarea 
                    value={newsForm.content} 
                    onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} 
                    required 
                />
            </div>
            <div className="btn-group">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Нийтэлж байна...' : 'Нийтлэх'}
                </button>
                <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSubmitting}>
                    Цуцлах
                </button>
            </div>
        </form>
    );
}

export default ChurchNewsForm;
