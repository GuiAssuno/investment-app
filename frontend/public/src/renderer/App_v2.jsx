import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import './styles/global.css';

// Layout Components
import Toolbar from './components/common/Toolbar';
import TickerTape from './components/widgets/TickerTape';
import NewsPanel from './components/widgets/NewsPanel';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import TradingDesk from './pages/trading/TradingDesk';
import Portfolio from './pages/portfolio/Portfolio';
import MarketAnalysis from './pages/analysis/MarketAnalysis';
import Settings from './pages/settings/Settings';

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Verificar autenticação
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!isAuthenticated) {
    return (
      <Provider store={store}>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <Router>
        <div className="app-container h-screen flex flex-col bg-background">
          {/* Toolbar */}
          <Toolbar theme={theme} onThemeToggle={toggleTheme} />
          
          {/* Ticker Tape */}
          <TickerTape />
          
          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Area */}
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/trading" element={<TradingDesk />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/analysis" element={<MarketAnalysis />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
            
            {/* News Panel - Fixed on Right */}
            <NewsPanel />
          </div>
        </div>
      </Router>
    </Provider>
  );
};

export default App;