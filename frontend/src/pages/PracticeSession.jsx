import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Check, Lightbulb, RefreshCw } from 'lucide-react';
import { getLessonStatus } from '../services/api';
import { useLessonStore } from '../store/lessonStore';
import './PracticeSession.css';

// Load YouTube IFrame API
function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    if (!document.getElementById('youtube-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  });
}

function PracticeSession() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const {
    setSegmentsData,
    status,
    segments,
    currentSegmentIndex,
    nextSegment,
    prevSegment,
    resetToStart,
  } = useLessonStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [videoId, setVideoId] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef(null);       // YouTube Player instance
  const intervalRef = useRef(null);     // progress polling interval
  const iframeContainerId = 'yt-player-container';

  const currentSegment = segments[currentSegmentIndex];

  // ── 1. Fetch lesson data ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await getLessonStatus(lessonId);
        if (response.status === 'ready') {
          setSegmentsData(response.segments, response.total_segments);
          if (response.youtube_id) setVideoId(response.youtube_id);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        navigate('/');
      }
    };
    fetchLesson();
  }, [lessonId, navigate, setSegmentsData]);

  // ── 2. Init YouTube player once videoId is known ──────────────────────────
  useEffect(() => {
    if (!videoId) return;

    let player;
    loadYouTubeAPI().then((YT) => {
      player = new YT.Player(iframeContainerId, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          controls: 1,
        },
        events: {
          onReady: (e) => {
            playerRef.current = e.target;
            setPlayerReady(true);
            // Seek to first segment start
            const seg = useLessonStore.getState().segments[0];
            if (seg) e.target.seekTo(seg.start, true);
          },
          onStateChange: (e) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2
            if (e.data === 1) setIsPlaying(true);
            if (e.data === 2 || e.data === 0) setIsPlaying(false);
          },
        },
      });
    });

    return () => {
      if (player && player.destroy) player.destroy();
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [videoId]);

  // ── 3. Poll current time to auto-pause at segment end ────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!playerReady || !isPlaying || !currentSegment) return;

    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;
      const t = player.getCurrentTime();
      if (t >= currentSegment.end) {
        player.pauseVideo();
        player.seekTo(currentSegment.start, true);
        setIsPlaying(false);
      }
    }, 200);

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playerReady, currentSegment]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handlePlayPause = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      if (currentSegment) player.seekTo(currentSegment.start, true);
      player.playVideo();
    }
  };

  const handleReplay = () => {
    const player = playerRef.current;
    if (!player || !currentSegment) return;
    player.seekTo(currentSegment.start, true);
    player.playVideo();
    setIsPlaying(true);
  };

  const resetState = useCallback((newIndex) => {
    setUserInput('');
    setAssessmentResult(null);
    setHintLevel(0);
    setIsPlaying(false);
    const player = playerRef.current;
    if (player) {
      player.pauseVideo();
      // Seek then auto-play the new segment
      setTimeout(() => {
        const seg = useLessonStore.getState().segments[newIndex];
        if (seg) {
          player.seekTo(seg.start, true);
          player.playVideo();
          setIsPlaying(true);
        }
      }, 150);
    }
  }, []);

  const handleNext = () => {
    const nextIdx = Math.min(currentSegmentIndex + 1, segments.length - 1);
    nextSegment();
    resetState(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = Math.max(currentSegmentIndex - 1, 0);
    prevSegment();
    resetState(prevIdx);
  };

  const handleResetSession = () => {
    resetToStart();
    setUserInput('');
    setAssessmentResult(null);
    setHintLevel(0);
    setIsPlaying(false);
    const player = playerRef.current;
    if (player) {
      player.pauseVideo();
      setTimeout(() => {
        const seg = useLessonStore.getState().segments[0];
        if (seg) {
          player.seekTo(seg.start, true);
          player.playVideo();
          setIsPlaying(true);
        }
      }, 150);
    }
  };

  // Enter in textarea → check; Enter on result screen → next segment
  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (userInput.trim() && currentSegment) handleCheckAnswer(e);
    }
  };

  useEffect(() => {
    if (!assessmentResult) return;
    // Delay listener so the current Enter keyup doesn't immediately fire handleNext
    let listener;
    const timer = setTimeout(() => {
      listener = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleNext();
        }
      };
      window.addEventListener('keyup', listener);
    }, 200);
    return () => {
      clearTimeout(timer);
      if (listener) window.removeEventListener('keyup', listener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentResult]);

  // Esc / Ctrl+↑ → replay | Ctrl+← → prev | Ctrl+→ → next
  useEffect(() => {
    const onKey = (e) => {
      // Escape replays always
      if (e.key === 'Escape') {
        e.preventDefault();
        handleReplay();
        return;
      }

      // Ctrl+Arrow shortcuts (work even in textarea)
      if (!e.ctrlKey && !e.metaKey) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleReplay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerReady, currentSegment, currentSegmentIndex, segments.length]);

  const handleCheckAnswer = (e) => {
    e.preventDefault();
    if (!userInput.trim() || !currentSegment) return;

    const expectedTokens = currentSegment.text.toLowerCase().replace(/[^\w\s]/g, '').split(' ');
    const userTokens = userInput.toLowerCase().replace(/[^\w\s]/g, '').split(' ');
    let correct = 0;
    expectedTokens.forEach((token, i) => { if (userTokens[i] === token) correct++; });
    const score = Math.floor((correct / expectedTokens.length) * 100);

    setAssessmentResult({ score, correct: score === 100, expected: currentSegment.text });
  };

  const handleHint = () => {
    if (!currentSegment) return;
    const words = currentSegment.text.split(' ');
    if (hintLevel === 0) setUserInput(words.map(() => '_').join(' '));
    else if (hintLevel === 1) setUserInput(words.map(w => w[0] + '_'.repeat(w.length - 1)).join(' '));
    else setUserInput(currentSegment.text);
    setHintLevel(prev => (prev + 1) % 3);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (status !== 'ready') {
    return (
      <div className="practice-loading text-center">
        <div className="spinner"></div>
        <p className="mt-4">Loading practice session...</p>
      </div>
    );
  }

  const progressPercent = (currentSegmentIndex / segments.length) * 100;

  return (
    <div className="practice-container animate-fade-in">

      <div className="practice-header">
        <div className="practice-header-top">
          <div>
            <h2 className="text-gradient">Session Progress</h2>
            <p className="text-secondary">Segment {currentSegmentIndex + 1} of {segments.length}</p>
          </div>
          <button
            className="btn-reset-session"
            onClick={handleResetSession}
            title="Restart from segment 1"
          >
            <RefreshCw size={16} />
            Restart
          </button>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="practice-grid">

        {/* Player Section */}
        <div className="glass-panel player-section">
          <div className="player-wrapper">
            {/* YouTube mounts into this div */}
            <div id={iframeContainerId} style={{ width: '100%', height: '100%' }}></div>
            {!videoId && (
              <div className="player-placeholder"><p>Loading video...</p></div>
            )}
          </div>

          <div className="player-controls">
            <button className="icon-btn" onClick={handlePrev} disabled={currentSegmentIndex === 0}>
              <SkipBack size={24} />
            </button>
            <button className="icon-btn play-btn" onClick={handlePlayPause} disabled={!playerReady}>
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            <button className="icon-btn replay-btn" onClick={handleReplay} disabled={!playerReady} title="Replay segment (Esc / Ctrl+↑)">
              <RotateCcw size={24} />
              <span className="btn-shortcut-hint">Esc</span>
            </button>
            <button className="icon-btn" onClick={handleNext} disabled={currentSegmentIndex === segments.length - 1}>
              <SkipForward size={24} />
            </button>
          </div>
        </div>

        {/* Input & Assessment Section */}
        <div className="glass-panel assessment-section">
          <h3 className="mb-4">Type what you hear</h3>

          {!assessmentResult ? (
            <form onSubmit={handleCheckAnswer} className="assessment-form">
              <textarea
                className="input-field practice-textarea"
                placeholder="Listen carefully and type... (Enter to check)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                autoFocus
              ></textarea>

              <div className="assessment-actions">
                <button type="button" className="btn-secondary" onClick={handleHint}>
                  <Lightbulb size={18} /> Show Hint
                </button>
                <button type="submit" className="btn-primary" disabled={!userInput.trim() || isChecking}>
                  <Check size={18} /> Check Answer
                </button>
              </div>
            </form>
          ) : (
            <div className="result-container animate-fade-in">
              <p className="text-secondary text-sm" style={{textAlign:'center', marginBottom:'0.5rem'}}>Press <kbd style={{background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:'4px'}}>Enter</kbd> to continue to next segment</p>
              <div className={`result-score ${assessmentResult.score >= 90 ? 'score-good' : 'score-bad'}`}>
                Score: {assessmentResult.score}%
              </div>

              <div className="result-comparison">
                <div className="result-box">
                  <span className="text-secondary text-sm">Your answer</span>
                  <p>{userInput}</p>
                </div>
                <div className="result-box expected-box">
                  <span className="text-secondary text-sm">Expected answer</span>
                  <p>{assessmentResult.expected}</p>
                </div>
              </div>

              <div className="result-actions mt-4">
                <button className="btn-secondary" onClick={handleReplay}>
                  <RotateCcw size={18} /> Replay Audio
                </button>
                <button className="btn-primary" onClick={handleNext}>
                  Next Segment <SkipForward size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PracticeSession;
