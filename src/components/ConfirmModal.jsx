import React from 'react';

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
        }}>
            <div style={{
                background: 'var(--surface-color)',
                padding: '2rem',
                borderRadius: '16px',
                maxWidth: '360px',
                width: '100%',
                border: '1px solid var(--border-color)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                textAlign: 'center',
                animation: 'zoomIn 0.2s ease-out'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-color)' }}>{message}</h3>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-danger" onClick={onConfirm} style={{ flex: 1, padding: '0.8rem' }}>Тийм, устгах</button>
                    <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1, padding: '0.8rem' }}>Үгүй, болих</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
