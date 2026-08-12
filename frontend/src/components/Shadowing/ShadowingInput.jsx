import React, { useState } from 'react';
import axios from 'axios';
import './Shadowing.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function ShadowingInput({ onGenerated }) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!text || wordCount === 0) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/shadowing/generate`, {
        text,
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Default: Bella
        style: 'natural'
      });
      onGenerated(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'An error occurred while generating audio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel input-card">
      {isLoading ? (
        <div className="processing-state text-center">
          <div className="spinner"></div>
          <h3 className="animate-pulse">Generating your practice...</h3>
          <p className="text-secondary">Synthesizing audio and timestamps via ElevenLabs</p>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="url-form">
          <div className="input-group">
            <textarea
              className="input-field text-area"
              placeholder="Paste your English text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="6"
            />
          </div>
          
          <div className="text-stats">
            <span className="text-secondary">{wordCount} words</span>
            {wordCount > 0 && (
              <button type="button" className="text-btn" onClick={() => setText('')}>
                Clear text
              </button>
            )}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="selectors">
            <div className="selector">
              <label>Voice</label>
              <select className="input-field" disabled>
                <option>American English (Bella)</option>
              </select>
            </div>
            <div className="selector">
              <label>Speaking style</label>
              <select className="input-field" disabled>
                <option>Natural & Expressive</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn-primary w-full mt-4" disabled={wordCount === 0}>
            Generate Shadowing
          </button>
        </form>
      )}
    </div>
  );
}

export default ShadowingInput;
