import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeVideo, getLessonStatus } from '../services/api';
import './YouTubeDictation.css';

function YouTubeDictation() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    setError('');
    setStatusText('Preparing your lesson...');
    
    try {
      const response = await analyzeVideo(url);
      const lessonId = response.lesson_id;
      
      // Start polling
      setStatusText('AI is creating listening segments...');
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await getLessonStatus(lessonId);
          if (statusRes.status === 'ready') {
            clearInterval(pollInterval);
            navigate(`/practice/${lessonId}`);
          } else if (statusRes.status === 'failed') {
            clearInterval(pollInterval);
            setError('Failed to process the video. Please check the URL or try another one.');
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while analyzing the video.');
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container animate-fade-in">
      <div className="hero-section text-center">
        <h1 className="hero-title">Learn English from <span className="text-gradient">Any YouTube Video</span></h1>
        <p className="hero-subtitle">Paste a YouTube URL and we'll turn its captions into a step-by-step listening practice.</p>
      </div>

      <div className="glass-panel input-card">
        {isLoading ? (
          <div className="processing-state text-center">
            <div className="spinner"></div>
            <h3 className="animate-pulse">{statusText}</h3>
            <p className="text-secondary">This might take a minute depending on the video length.</p>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="url-form">
            <div className="input-group">
              <input
                type="text"
                className="input-field"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="supported-links">
              <span>✓ watch links</span>
              <span>✓ youtu.be</span>
              <span>✓ Shorts</span>
            </div>
            
            <button type="submit" className="btn-primary w-full mt-4" disabled={!url}>
              Generate Exercise
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default YouTubeDictation;
