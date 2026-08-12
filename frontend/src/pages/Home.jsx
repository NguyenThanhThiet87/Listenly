import React from 'react';
import YouTubeDictation from './YouTubeDictation';
import ShadowingStudio from './ShadowingStudio';

function Home({ activeTab }) {
  return (
    <div className="home-tabs-container">
      <div className="tab-content">
        {activeTab === 'youtube' ? <YouTubeDictation /> : <ShadowingStudio />}
      </div>
    </div>
  );
}

export default Home;
