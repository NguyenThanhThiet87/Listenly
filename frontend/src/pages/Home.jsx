import React, { useState } from 'react';
import YouTubeDictation from './YouTubeDictation';
import ShadowingStudio from './ShadowingStudio';
import './HomeTabs.css';

function Home() {
  const [activeTab, setActiveTab] = useState('youtube');

  return (
    <div className="home-tabs-container">
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'youtube' ? 'active' : ''}`}
          onClick={() => setActiveTab('youtube')}
        >
          YouTube Dictation
        </button>
        <button 
          className={`tab-btn ${activeTab === 'shadowing' ? 'active' : ''}`}
          onClick={() => setActiveTab('shadowing')}
        >
          Shadowing Studio
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'youtube' ? <YouTubeDictation /> : <ShadowingStudio />}
      </div>
    </div>
  );
}

export default Home;
