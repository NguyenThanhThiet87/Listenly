import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PracticeSession from './pages/PracticeSession';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header glass-panel">
          <div className="logo text-gradient">Listenly</div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice/:lessonId" element={<PracticeSession />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
