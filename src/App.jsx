import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import DailyPost from './components/DailyPost';
import Archive from './components/Archive';
import PostDetail from './components/PostDetail';
import Logo from './components/Logo';
import Footer from './components/Footer';
import './App.css';

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', { page_path: location.pathname });
    }
  }, [location]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="main-nav">
          <Link to="/" className="nav-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Logo size={24} />
            <span className="brand-name">Edge Daily</span>
          </Link>
          <div className="nav-buttons">
            <Link to="/archive">
              <button>Archive</button>
            </Link>
          </div>
        </nav>

        <RouteTracker />
        <Routes>
          <Route path="/" element={<DailyPost />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/post/:slug" element={<PostDetail />} />
        </Routes>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;