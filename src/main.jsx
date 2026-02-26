import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Admin from './Admin.jsx'
import Auth from './Auth.jsx'
import Article from './Article.jsx'
import Testimonies from './Testimonies.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/news-portal">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/testimonies" element={<Testimonies />} />
        <Route path="/reset-password" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
