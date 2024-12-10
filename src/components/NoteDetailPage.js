import React from 'react';
import './NoteDetailPage.css';

function NoteDetailPage({ note, onBack }) {
    return (
        <div className="note-detail-container">
            <div className="note-detail-header">
                <button className="back-button" onClick={onBack}>
                    ← 返回
                </button>
                <div className="note-title-section">
                    <h2>{note.title}</h2>
                </div>
            </div>

            <div className="note-meta">
                <span className="meta-item">
                    <span className="meta-icon">👤</span>
                    {note.author || 'H'}
                </span>
                <span className="meta-item">
                    <span className="meta-icon">🕒</span>
                    {note.updateTime}
                </span>
            </div>

            <div className="note-content">
                <div className="text-content">
                    {note.content}
                </div>
            </div>

            <div className="note-actions">
                <button className="action-btn share">
                    <span role="img" aria-label="分享">
                        <svg className="wechat-icon" width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8.2,13.3c-0.3,0-0.6-0.3-0.6-0.6c0-0.3,0.3-0.6,0.6-0.6c0.4,0,0.6,0.3,0.6,0.6C8.8,13,8.6,13.3,8.2,13.3z M13.7,13.3 c-0.3,0-0.6-0.3-0.6-0.6c0-0.3,0.3-0.6,0.6-0.6c0.3,0,0.6,0.3,0.6,0.6C14.3,13,14,13.3,13.7,13.3z M11,2C5.5,2,1,6.5,1,12 c0,2.1,0.6,4,1.7,5.6L1.5,22l4.4-1.1C7.1,21.6,8.5,22,11,22c5.5,0,10-4.5,10-10C21,6.5,16.5,2,11,2z M16.2,14.8 c-0.9,0.9-2.2,1.4-3.7,1.4c-1.2,0-2.3-0.3-3.3-0.8l-3.3,0.8l0.8-3.3c-0.5-1-0.8-2.1-0.8-3.3c0-1.5,0.5-2.8,1.4-3.7 c0.9-0.9,2.2-1.4,3.7-1.4c1.5,0,2.8,0.5,3.7,1.4c0.9,0.9,1.4,2.2,1.4,3.7C17.6,12.6,17.1,13.9,16.2,14.8z"/>
                        </svg>
                    </span>
                    分享
                </button>
                <button className="action-btn podcast">
                    <span role="img" aria-label="转为播客">🎙️</span>
                    转为播客
                </button>
                <button className="action-btn delete">
                    <span role="img" aria-label="删除">🗑️</span>
                    删除
                </button>
            </div>
        </div>
    );
}

export default NoteDetailPage; 