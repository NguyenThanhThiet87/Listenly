import React, { useState } from 'react';
import ShadowingInput from '../components/Shadowing/ShadowingInput';
import ShadowingPlayer from '../components/Shadowing/ShadowingPlayer';
import './ShadowingStudio.css';

function ShadowingStudio() {
  const [session, setSession] = useState(null); // Will hold the session data (audio_url, words, etc.)

  return (
    <div className="shadowing-studio animate-fade-in">
      <div className="hero-section text-center">
        <h1 className="hero-title">Create a <span className="text-gradient">Shadowing Practice</span></h1>
        <p className="hero-subtitle">Turn any English text into a natural speaking exercise.</p>
      </div>

      {!session ? (
        <ShadowingInput onGenerated={(data) => setSession(data)} />
      ) : (
        <div className="player-wrapper">
          <button className="btn-secondary back-btn" onClick={() => setSession(null)}>
            &larr; Back to Studio
          </button>
          <ShadowingPlayer session={session} />
        </div>
      )}
    </div>
  );
}

export default ShadowingStudio;
