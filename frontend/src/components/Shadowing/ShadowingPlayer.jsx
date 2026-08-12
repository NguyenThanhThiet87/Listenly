import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import './Shadowing.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function ShadowingPlayer({ session }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);
  const textContainerRef = useRef(null);

  const { id, words, duration } = session;
  const audioUrl = `${API_BASE_URL}/shadowing/audio/${id}.mp3`;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (amount) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        Math.max(audioRef.current.currentTime + amount, 0),
        duration
      );
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find current active word index
  const activeWordIndex = words.findIndex(
    w => currentTime >= w.start && currentTime <= w.end
  );

  // Auto-scroll logic
  useEffect(() => {
    if (activeWordIndex !== -1 && textContainerRef.current) {
      const activeElement = document.getElementById(`word-${activeWordIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeWordIndex]);

  return (
    <div className="shadowing-player glass-panel">
      <div className="player-header">
        <h2 className="title">Shadowing Practice</h2>
        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="controls">
        <button className="control-btn" onClick={() => handleSeek(-5)}>
          <RotateCcw size={20} />
        </button>
        <button className="control-btn main-play-btn" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="play-icon" />}
        </button>
        <button className="control-btn" onClick={() => handleSeek(5)}>
          <RotateCw size={20} />
        </button>
      </div>

      <div className="speed-controls">
        <span className="speed-label">Speed:</span>
        {[0.75, 1, 1.25, 1.5].map(rate => (
          <button 
            key={rate}
            className={`speed-btn ${playbackRate === rate ? 'active' : ''}`}
            onClick={() => setPlaybackRate(rate)}
          >
            {rate}x
          </button>
        ))}
      </div>

      <div className="transcript-viewer" ref={textContainerRef}>
        <div className="text-content">
          {words.map((w, index) => (
            <span
              key={index}
              id={`word-${index}`}
              className={`transcript-word ${index === activeWordIndex ? 'active' : ''} ${currentTime > w.end ? 'played' : ''}`}
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = w.start;
                  if (!isPlaying) setIsPlaying(true);
                }
              }}
            >
              {w.text}{' '}
            </span>
          ))}
        </div>
      </div>

      <div className="mode-selector">
        <div className="mode active">🎧 Listen</div>
        <div className="mode">🎤 Shadow</div>
        <div className="mode">🔒 Challenge</div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default ShadowingPlayer;
