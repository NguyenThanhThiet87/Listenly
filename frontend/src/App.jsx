import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PracticeSession from './pages/PracticeSession';
import './App.css';
import './pages/HomeTabs.css';

function App() {
  const [activeTab, setActiveTab] = useState('youtube');

  return (
    <Router>
      <div className="app-container">
        <header className="app-header glass-panel">
          <div className="logo-container">
            <div className="logo text-gradient">Listenly</div>
          </div>
          <Routes>
            <Route path="/" element={
              <div className="tabs-header-nav">
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
            } />
            <Route path="*" element={null} />
          </Routes>
          <div className="header-spacer"></div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home activeTab={activeTab} />} />
            <Route path="/practice/:lessonId" element={<PracticeSession />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
