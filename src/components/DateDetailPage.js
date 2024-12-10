import React, { useState, useEffect, useRef } from 'react';
import './DateDetailPage.css';

function DateDetailPage({ date, onBack }) {
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioRef = useRef(new Audio());
    const [filterType, setFilterType] = useState('all'); // 'all', 'audio', 'image', 'webpage'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // 每页显示5条记录

    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                setLoading(true);
                const username = localStorage.getItem('username') || 'default_user';
                const response = await fetch(
                    `http://localhost:5000/get-recordings?date=${date}&username=${username}`
                );
                
                if (!response.ok) {
                    throw new Error('获取录音记录失败');
                }
                
                const data = await response.json();
                console.log('Fetched recordings:', data.recordings);
                setRecordings(data.recordings);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching recordings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecordings();

        // 清理函数
        return () => {
            audioRef.current.pause();
            audioRef.current.src = '';
        };
    }, [date]);

    const handlePlay = async (recording) => {
        try {
            if (currentlyPlaying === recording.filename) {
                audioRef.current.pause();
                setCurrentlyPlaying(null);
                setProgress(0);
            } else {
                const response = await fetch(`http://localhost:5000/get-audio/${recording.filename}`, {
                    headers: {
                        'username': localStorage.getItem('username') || 'default_user'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('获取音频失败');
                }

                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                
                audioRef.current.pause();
                audioRef.current.src = audioUrl;
                
                audioRef.current.ontimeupdate = () => {
                    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                    setProgress(progress);
                };
                
                await audioRef.current.play();
                setCurrentlyPlaying(recording.filename);

                audioRef.current.onended = () => {
                    setCurrentlyPlaying(null);
                    setProgress(0);
                };
            }
        } catch (err) {
            console.error('Error playing audio:', err);
            alert('播放音频失败');
        }
    };

    const handleDownload = async (recording) => {
        try {
            const response = await fetch(`http://localhost:5000/get-audio/${recording.filename}`, {
                headers: {
                    'username': localStorage.getItem('username') || 'default_user'
                }
            });
            
            if (!response.ok) {
                throw new Error('获取音频失败');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = recording.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error downloading audio:', err);
            alert('下载音频失败');
        }
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    };

    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const FilterButtons = () => (
        <div className="filter-buttons">
            <button 
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => {
                    setFilterType('all');
                    setCurrentPage(1);
                }}
            >
                全部
            </button>
            <button 
                className={`filter-btn ${filterType === 'audio' ? 'active' : ''}`}
                onClick={() => {
                    setFilterType('audio');
                    setCurrentPage(1);
                }}
            >
                🎵 音频
            </button>
            <button 
                className={`filter-btn ${filterType === 'image' ? 'active' : ''}`}
                onClick={() => {
                    setFilterType('image');
                    setCurrentPage(1);
                }}
            >
                🖼️ 图片
            </button>
            <button 
                className={`filter-btn ${filterType === 'webpage' ? 'active' : ''}`}
                onClick={() => {
                    setFilterType('webpage');
                    setCurrentPage(1);
                }}
            >
                🌐 网页
            </button>
        </div>
    );

    const paginateRecordings = (items) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    const Pagination = ({ totalItems }) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) return null;

        return (
            <div className="pagination">
                <button 
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    上一页
                </button>
                <span className="page-info">
                    {currentPage} / {totalPages}
                </span>
                <button 
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    下一页
                </button>
            </div>
        );
    };

    const filteredRecordings = recordings.filter(recording => 
        filterType === 'all' || recording.type === filterType
    );

    const paginatedRecordings = filteredRecordings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="date-detail-container">
            <div className="date-detail-header">
                <button className="back-button" onClick={onBack}>
                    ← 返回
                </button>
                <h2>{formatDate(date)}的数据记录</h2>
            </div>

            <FilterButtons />

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="recordings-container">
                {loading ? (
                    <div className="loading">加载中...</div>
                ) : filteredRecordings.length > 0 ? (
                    <>
                        {paginatedRecordings.map((recording, index) => (
                            <div key={index} className="recording-item">
                                <div className="recording-header">
                                    <span className="recording-time">{recording.time}</span>
                                    <div className="recording-actions">
                                        <button 
                                            className={`action-btn ${currentlyPlaying === recording.filename ? 'playing' : ''}`}
                                            onClick={() => handlePlay(recording)}
                                            title={currentlyPlaying === recording.filename ? "暂停" : "播放"}
                                        >
                                            <span role="img" aria-label={currentlyPlaying === recording.filename ? "暂停" : "播放"}>
                                                {currentlyPlaying === recording.filename ? '⏸️' : '▶️'}
                                            </span>
                                        </button>
                                        <button 
                                            className="action-btn"
                                            onClick={() => handleDownload(recording)}
                                            title="下载"
                                        >
                                            <span role="img" aria-label="下载">💾</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="audio-controls-container">
                                    <input
                                        type="range"
                                        className="audio-progress"
                                        value={currentlyPlaying === recording.filename ? progress : 0}
                                        min="0"
                                        max="100"
                                        onChange={(e) => {
                                            if (currentlyPlaying === recording.filename) {
                                                const time = (e.target.value / 100) * audioRef.current.duration;
                                                audioRef.current.currentTime = time;
                                                setProgress(e.target.value);
                                            }
                                        }}
                                    />
                                    <div className="volume-control">
                                        <input
                                            type="range"
                                            className="volume-slider"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={volume}
                                            onChange={(e) => {
                                                const newVolume = parseFloat(e.target.value);
                                                setVolume(newVolume);
                                                if (audioRef.current) {
                                                    audioRef.current.volume = newVolume;
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                {recording.transcript && (
                                    <div className="recording-content">
                                        <p>{recording.transcript}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        <Pagination totalItems={filteredRecordings.length} />
                    </>
                ) : (
                    <div className="no-recordings">
                        {filterType === 'all' ? '当天没有记录' : `当天没有${
                            filterType === 'audio' ? '音频' : 
                            filterType === 'image' ? '图片' : '网页'
                        }记录`}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DateDetailPage; 