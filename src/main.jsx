import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Admin from './Admin.jsx'
import Auth from './Auth.jsx'
import Article from './Article.jsx'
import Testimonies from './Testimonies.jsx'
import Songs from './Songs.jsx'
import Audiobooks from './Audiobooks.jsx'
import Churches from './Churches.jsx'
import Prayers from './Prayers.jsx'

import { PlayerProvider } from './context/PlayerContext'
import { ThemeProvider } from './context/ThemeContext'
import GlobalPlayer from './components/GlobalPlayer'
import BottomNav from './components/BottomNav'

// Check for environment variables
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!isSupabaseConfigured && window.location.hostname !== 'localhost') {
  createRoot(document.getElementById('root')).render(
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>🛠️ Configuration Error</h1>
      <p>Supabase connection details are missing.</p>
      <p>Please check Vercel Environment Variables: <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</p>
    </div>
  );
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <PlayerProvider>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/churches" element={<Churches />} />
              <Route path="/prayers" element={<Prayers />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/article/:id" element={<Article />} />
              <Route path="/testimonies" element={<Testimonies />} />
              <Route path="/songs" element={<Songs />} />
              <Route path="/audiobooks" element={<Audiobooks />} />
              <Route path="/reset-password" element={<Auth />} />
            </Routes>
            <BottomNav />
            <GlobalPlayer />
          </PlayerProvider>
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW Registered', reg))
      .catch(err => console.log('SW Failed', err));
  });
}
