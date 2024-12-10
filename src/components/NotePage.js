import React, { useState, useRef, useEffect } from 'react';
import './NotePage.css';
import SearchResults from './SearchResults';
import DateDetailPage from './DateDetailPage';
import NoteDetailPage from './NoteDetailPage';

function NotePage({ username }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('正在聆听...');
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [recordingDates, setRecordingDates] = useState(new Set());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [recentNotes, setRecentNotes] = useState([]);
    const [sidebarNotes, setSidebarNotes] = useState([]);
    const [notes, setNotes] = useState([
        // Add some sample notes or fetch from your backend
        {
            id: 1,
            title: "Sample Note",
            icon: "📝",
            content: "Sample content"
        }
    ]);

    useEffect(() => {
        const checkTodayRecordings = async () => {
            try {
                const username = localStorage.getItem('username') || 'default_user';
                const today = new Date();
                const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                
                const response = await fetch(
                    `http://localhost:5000/get-recordings?date=${formattedDate}&username=${username}`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.recordings && data.recordings.length > 0) {
                        setRecordingDates(prev => {
                            const newDates = new Set(prev);
                            newDates.add(formattedDate);
                            return newDates;
                        });
                    }
                }
            } catch (error) {
                console.error('Error checking today recordings:', error);
            }
        };

        checkTodayRecordings();
    }, []);

    useEffect(() => {
        const fetchRecentNotes = async () => {
            try {
                const username = localStorage.getItem('username') || 'default_user';
                const response = await fetch(
                    `http://localhost:5000/get-recent-notes?username=${username}`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched notes:', data.notes);
                    setRecentNotes(data.notes);
                    setSidebarNotes(data.notes);
                } else {
                    console.error('Failed to fetch notes');
                }
            } catch (error) {
                console.error('Error fetching recent notes:', error);
            }
        };

        fetchRecentNotes();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            setShowSearchResults(true);
        }
    };

    const handleBackFromSearch = () => {
        setShowSearchResults(false);
        setSearchQuery('');
    };

    const handleMicClick = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                
                mediaRecorderRef.current.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                    chunksRef.current = [];
                    
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.wav');
                    formData.append('username', localStorage.getItem('username') || 'default_user');
                    
                    try {
                        setTranscript('正在保存录音...');
                        const response = await fetch('http://localhost:5000/save-audio', {
                            method: 'POST',
                            body: formData
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            setTranscript(`录音已保存: ${data.filename}`);
                            setRecordingDates(prev => {
                                const today = new Date();
                                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                const newDates = new Set(prev);
                                newDates.add(dateStr);
                                return newDates;
                            });
                        } else {
                            const errorData = await response.json();
                            setTranscript(errorData.error || '保存录音失败');
                        }
                    } catch (error) {
                        console.error('Error saving audio:', error);
                        setTranscript('保存录音时发生错误');
                    }
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
                setTranscript('正在录音...');
            } catch (err) {
                console.error('Error accessing microphone:', err);
                setTranscript('无法访问麦克风');
            }
        } else {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleClearTranscript = () => {
        setTranscript('正在聆听...');
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() + direction);
            return newDate;
        });
    };

    const handleDateClick = (day) => {
        if (day.isCurrentMonth) {
            const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.day);
            const formattedDate = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;
            setSelectedDate(formattedDate);
        }
    };

    const handleBackFromDate = () => {
        setSelectedDate(null);
    };

    const handleNoteClick = (note) => {
        setSelectedNote(note);
    };

    const handleBackFromNote = () => {
        setSelectedNote(null);
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return '刚刚';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes}分钟前`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours}小时前`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays}天前`;
        }
        
        if (diffInDays < 30) {
            return `${Math.floor(diffInDays / 7)}周前`;
        }
        
        return `${Math.floor(diffInDays / 30)}月前`;
    };

    const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
    const MONTHS = [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
    ];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];
        const today = new Date();

        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                isCurrentMonth: false,
                isToday: false
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                day: i,
                isCurrentMonth: true,
                isToday: today.getDate() === i &&
                         today.getMonth() === month &&
                         today.getFullYear() === year,
                hasRecording: recordingDates.has(dateStr)
            });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                isToday: false
            });
        }

        return days;
    };

    const formatMonth = (date) => {
        return `${date.getFullYear()}年 ${MONTHS[date.getMonth()]}`;
    };

    return (
        <div className="note-container">
            <button className="menu-toggle" onClick={toggleSidebar}>
                ☰
            </button>

            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>H</h2>
                    <div className="workspace-name">Huan Gao's workspace</div>
                    <button className="new-page-btn">
                        <span>⚡</span>
                    </button>
                </div>

                <div className="sidebar-section">
                    <h3>你的笔记</h3>
                    {sidebarNotes.map((note) => (
                        <div 
                            key={note.id} 
                            className="nav-item"
                            onClick={() => handleNoteClick(note)}
                        >
                            <span>{note.icon}</span>
                            <span className="nav-item-title">{note.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="main-content">
                {selectedNote ? (
                    <NoteDetailPage 
                        note={selectedNote}
                        onBack={handleBackFromNote}
                        notes={notes}
                        onNoteSelect={handleNoteClick}
                    />
                ) : selectedDate ? (
                    <DateDetailPage 
                        date={selectedDate}
                        onBack={handleBackFromDate}
                    />
                ) : (
                    <>
                        <div className="content-header">
                            <h1>你好呀，{username}</h1>
                        </div>

                        <div className="search-section">
                            <div className="search-bar">
                                <input 
                                    type="text" 
                                    placeholder="搜索..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <span className="search-icon">🔍</span>
                            </div>
                            <button className="search-button" onClick={handleSearch}>搜索</button>
                        </div>

                        {showSearchResults ? (
                            <SearchResults 
                                query={searchQuery} 
                                onBack={handleBackFromSearch}
                            />
                        ) : (
                            <div className="main-sections">
                                <div className="notes-section">
                                    <div className="section-title">最近访问笔记</div>
                                    <div className="note-grid">
                                        {recentNotes.length > 0 ? (
                                            recentNotes.map((note) => (
                                                <div 
                                                    key={note.id}
                                                    className="note-card"
                                                    onClick={() => handleNoteClick(note)}
                                                >
                                                    <div className="note-card-header">
                                                        <span className="note-icon" role="img" aria-label={note.title}>
                                                            {note.icon}
                                                        </span>
                                                        <h3 className="note-title">{note.title}</h3>
                                                        <div className="note-meta">
                                                            <span className="author">{note.author?.charAt(0) || 'H'}</span>
                                                            <span>·</span>
                                                            <span className="time-tag">
                                                                {formatTimeAgo(new Date(note.updateTime))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-notes">
                                                <span className="empty-icon">📝</span>
                                                <p>暂无笔记</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="calendar-audio-container">
                                    <div className="calendar-section">
                                        <div className="section-title">日历</div>
                                        <div className="calendar-grid">
                                            <div className="calendar-header">
                                                <div className="calendar-nav">
                                                    <button 
                                                        className="calendar-nav-btn"
                                                        onClick={() => navigateMonth(-1)}
                                                        aria-label="上个月"
                                                    >
                                                        ◀
                                                    </button>
                                                    <h3>{formatMonth(currentDate)}</h3>
                                                    <button 
                                                        className="calendar-nav-btn"
                                                        onClick={() => navigateMonth(1)}
                                                        aria-label="下个月"
                                                    >
                                                        ▶
                                                    </button>
                                                </div>
                                                <div className="weekdays">
                                                    {WEEKDAYS.map((day, index) => (
                                                        <span key={index}>{day}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="calendar-days">
                                                {getDaysInMonth(currentDate).map((day, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`calendar-day ${
                                                            !day.isCurrentMonth ? 'other-month' : ''
                                                        } ${day.isToday ? 'today' : ''} ${
                                                            day.hasRecording ? 'has-recording' : ''
                                                        }`}
                                                        onClick={() => handleDateClick(day)}
                                                    >
                                                        {day.day}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tools-container">
                                        <div className="audio-section">
                                            <div className="section-title">语音输入</div>
                                            <div className="audio-container">
                                                <div className="audio-controls">
                                                    <button 
                                                        className={`audio-btn mic-btn ${isRecording ? 'active' : ''}`}
                                                        onClick={handleMicClick}
                                                    >
                                                        <span className="mic-icon">🎤</span>
                                                        <span className="mic-text">
                                                            {isRecording ? '停止' : '开启'}
                                                        </span>
                                                    </button>
                                                    <button className="audio-btn config-btn">
                                                        <span className="config-icon">⚙️</span>
                                                    </button>
                                                </div>
                                                <div className="audio-transcript">
                                                    <div className="transcript-header">
                                                        <span>转写</span>
                                                        <button className="clear-btn" onClick={handleClearTranscript}>
                                                            清除
                                                        </button>
                                                    </div>
                                                    <div className="transcript-content">
                                                        <p className="transcript-text">{transcript}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="webpage-parser-section">
                                            <div className="section-title">网页解析</div>
                                            <div className="parser-container">
                                                <div className="url-input-container">
                                                    <input
                                                        type="text"
                                                        className="url-input"
                                                        placeholder="输入网页链接..."
                                                    />
                                                    <button className="parse-button">解析</button>
                                                </div>
                                                <div className="parsed-content">
                                                    <div className="parsed-header">
                                                        <span>解析结果</span>
                                                        <button className="copy-btn">复制</button>
                                                    </div>
                                                    <div className="parsed-text-content">
                                                        <p className="placeholder-text">在上输入链接后点击解析...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="image-parser-section">
                                            <div className="section-title">图片解析</div>
                                            <div className="parser-container">
                                                <div className="image-upload-container">
                                                    <input 
                                                        type="file" 
                                                        id="image-upload" 
                                                        className="image-input" 
                                                        accept="image/*"
                                                        hidden
                                                    />
                                                    <label htmlFor="image-upload" className="upload-label">
                                                        <span className="upload-icon">📷</span>
                                                        <span>选择图片</span>
                                                    </label>
                                                    <button className="parse-button">解析</button>
                                                </div>
                                                <div className="parsed-content">
                                                    <div className="parsed-header">
                                                        <span>解析结果</span>
                                                        <button className="copy-btn">复制</button>
                                                    </div>
                                                    <div className="parsed-text-content">
                                                        <p className="placeholder-text">选择图片后点击解析...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default NotePage; 