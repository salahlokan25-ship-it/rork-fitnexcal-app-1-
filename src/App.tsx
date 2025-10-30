import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Testimonials from './pages/Testimonials';
import Settings from './pages/Settings';
import News from './pages/News';
import Success from './pages/Success';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { TradeProvider } from './context/TradeContext';

function App() {
  // For development/testing purposes, we'll show the main app without authentication
  // In production, you would implement proper authentication
  return (
    <TradeProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/success" element={<Success />} />
            <Route path="/news" element={<News />} />
            {/* For development, show main pages without authentication */}
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </TradeProvider>
  );
}

export default App;