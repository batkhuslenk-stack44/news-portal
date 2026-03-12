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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/news-portal">
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
          <GlobalPlayer />
        </PlayerProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
