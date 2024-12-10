import React, { useState } from 'react';
import './SearchResults.css';

function SearchResults({ query, onBack }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;  // 每页显示的结果数量
    const [selectedResult, setSelectedResult] = useState(null);

    // 模拟搜索结果数据
    const searchResults = [
        {
            type: 'audio',
            title: '会议录音.mp3',
            icon: '🎤',
            audioSrc: 'path_to_audio.mp3',
            asrText: '今天的会议主要讨论了项目进度...',
            recordTime: '2024-03-15 14:30',
            duration: '15:30'
        },
        {
            type: 'image',
            title: '项目架构图',
            icon: '🖼️',
            imageSrc: 'path_to_image.jpg',
            description: '一张详细的系统架构图，展示了各个模块之间的关系和数据流向...',
            uploadTime: '2024-03-14 09:45'
        },
        {
            type: 'web',
            title: '技术文档参考',
            icon: '🌐',
            url: 'https://example.com/tech-docs',
            summary: '该文档详细介绍了最新的API接口规范和使用方法...',
            saveTime: '2024-03-13 16:20'
        }
    ];

    // 过滤结果
    const filteredResults = activeCategory === 'all' 
        ? searchResults 
        : searchResults.filter(result => result.type === activeCategory);

    // 计算总页数
    const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

    // 获取当前页结果
    const getCurrentPageResults = () => {
        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        return filteredResults.slice(startIndex, endIndex);
    };

    // 渲染搜索结果项
    const renderResultItem = (result) => {
        switch (result.type) {
            case 'audio':
                return (
                    <div className="result-item audio-result">
                        <div className="result-icon">{result.icon}</div>
                        <div className="result-content">
                            <div className="result-header">
                                <h3>{result.title}</h3>
                                <div className="audio-controls">
                                    <audio controls>
                                        <source src={result.audioSrc} type="audio/mpeg" />
                                    </audio>
                                </div>
                            </div>
                            <div className="result-details">
                                <p className="asr-text">ASR转写文本: "{result.asrText}"</p>
                                <div className="result-meta">
                                    <span>录制于 {result.recordTime}</span>
                                    <span>时长: {result.duration}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div className="result-item image-result">
                        <div className="result-icon">{result.icon}</div>
                        <div className="result-content">
                            <div className="result-header">
                                <h3>{result.title}</h3>
                            </div>
                            <div className="result-details">
                                <div className="image-preview">
                                    <img src={result.imageSrc} alt={result.title} />
                                </div>
                                <p className="image-description">
                                    图片描述: {result.description}
                                </p>
                                <div className="result-meta">
                                    <span>上传于 {result.uploadTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'web':
                return (
                    <div className="result-item web-result">
                        <div className="result-icon">{result.icon}</div>
                        <div className="result-content">
                            <div className="result-header">
                                <h3>{result.title}</h3>
                                <a href={result.url} className="web-url" target="_blank" rel="noopener noreferrer">
                                    {result.url}
                                </a>
                            </div>
                            <div className="result-details">
                                <p className="web-summary">
                                    页面摘要: {result.summary}
                                </p>
                                <div className="result-meta">
                                    <span>保存于 {result.saveTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="search-results-container">
            <div className="search-header">
                <button className="back-button" onClick={onBack}>
                    ← 返回
                </button>
                <div className="search-info">
                    <h2>搜索结果: "{query}"</h2>
                    <span className="result-count">找到 {filteredResults.length} 个结果</span>
                </div>
            </div>

            <div className="search-categories">
                <div 
                    className={`category-tag ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                >
                    <span className="category-icon">📝</span>
                    <span>全部</span>
                </div>
                <div 
                    className={`category-tag ${activeCategory === 'audio' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('audio')}
                >
                    <span className="category-icon">🎤</span>
                    <span>音频</span>
                </div>
                <div 
                    className={`category-tag ${activeCategory === 'image' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('image')}
                >
                    <span className="category-icon">🖼️</span>
                    <span>图片</span>
                </div>
                <div 
                    className={`category-tag ${activeCategory === 'web' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('web')}
                >
                    <span className="category-icon">🌐</span>
                    <span>网页</span>
                </div>
            </div>

            <div className="search-results-layout">
                <div className="results-list">
                    {getCurrentPageResults().map((result, index) => (
                        <div 
                            key={index} 
                            onClick={() => setSelectedResult(result)}
                            className={`result-item ${selectedResult === result ? 'selected' : ''}`}
                        >
                            {renderResultItem(result)}
                        </div>
                    ))}
                </div>

                <div className="results-summary">
                    <div className="summary-header">
                        <div className="summary-title">
                            <span className="summary-icon">📋</span>
                            <h3>内容摘要</h3>
                        </div>
                    </div>
                    <div className="summary-content">
                        <div className="summary-section">
                            <div className="summary-card">
                                <h4>摘要</h4>
                                <p>
                                    要识别关键词，你可以使用Python标准库中的Keyword模块
                                    <a href="https://docs.pingcode.com" className="inline-citation" target="_blank" rel="noopener noreferrer">[1]</a>，
                                    或者使用jieba库进行TF-IDF算法分析
                                    <a href="https://blog.csdn.net" className="inline-citation" target="_blank" rel="noopener noreferrer">[2]</a>。
                                    示例代码中展示了如何提取文本中的关键词，并按重要性排序...
                                </p>
                            </div>
                        </div>
                        <div className="summary-references">
                            <div className="reference-card">
                                <div className="reference-header">
                                    <span className="reference-index">[1]</span>
                                    <a href="https://docs.pingcode.com" className="reference-link" target="_blank" rel="noopener noreferrer">
                                        如何归纳python中的关键字 | PingCode官方文档
                                    </a>
                                </div>
                                <p className="reference-excerpt">
                                    使用Python标准库中的keyword模块可以获取所有关键字列表...
                                </p>
                            </div>
                            <div className="reference-card">
                                <div className="reference-header">
                                    <span className="reference-index">[2]</span>
                                    <a href="https://blog.csdn.net" className="reference-link" target="_blank" rel="noopener noreferrer">
                                        Python 实战 | 文本分析之文本关键词提取 - CSDN博客
                                    </a>
                                </div>
                                <p className="reference-excerpt">
                                    使用jieba库进行TF-IDF算法分析，可以有效提取文本关键词...
                                </p>
                            </div>
                            <div className="reference-card">
                                <div className="reference-header">
                                    <span className="reference-index">[3]</span>
                                    <a href="https://blog.csdn.net" className="reference-link" target="_blank" rel="noopener noreferrer">
                                        提取文本关键词？很 easy 啊，...
                                    </a>
                                </div>
                                <p className="reference-excerpt">
                                    extract_tags函数可以快速提取出文本中的关键词...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pagination">
                <button 
                    className="page-btn" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                >
                    <span>⏮</span> 首页
                </button>
                <button 
                    className="page-btn" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    <span>◀</span> 上一页
                </button>
                <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                            key={pageNum}
                            className={`page-num ${pageNum === currentPage ? 'active' : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
                <button 
                    className="page-btn" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    下一页 <span>▶</span>
                </button>
                <button 
                    className="page-btn" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                >
                    末页 <span>⏭</span>
                </button>
            </div>
        </div>
    );
}

export default SearchResults; 