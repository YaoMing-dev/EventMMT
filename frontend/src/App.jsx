import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import Topbar from './components/layout/Topbar.jsx'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import RailButtons from './components/layout/RailButtons.jsx'
import ChatWidget from './components/layout/ChatWidget.jsx'
import HomeGate from './pages/HomeGate.jsx'
import EventPage from './pages/EventPage.jsx'
import WeddingPage from './pages/WeddingPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import useTheme from './hooks/useTheme.js'

const VIEW_BY_PATH = { '/su-kien': 'event', '/tiec-cuoi': 'wedding' }

function Shell() {
  const location = useLocation()
  const view = VIEW_BY_PATH[location.pathname] ?? 'home'
  const isSub = view !== 'home'
  const [theme, toggleTheme] = useTheme()

  useLayoutEffect(() => {
    document.body.dataset.view = view
    window.scrollTo(0, 0)
  }, [location.pathname, view])

  return (
    <>
      {isSub && <Topbar view={view} />}
      {isSub && <Header view={view} theme={theme} onToggleTheme={toggleTheme} />}
      <Routes>
        <Route path="/" element={<HomeGate />} />
        <Route path="/su-kien" element={<EventPage />} />
        <Route path="/tiec-cuoi" element={<WeddingPage />} />
        <Route path="/mmt-console-9f2k" element={<AdminPage />} />
      </Routes>
      {isSub && <Footer view={view} />}
      {isSub && <RailButtons view={view} />}
      {isSub && <ChatWidget key={view} view={view} />}
    </>
  )
}

export default function App() {
  // Render (goi free) cho ngu backend sau ~15 phut khong co request — lan
  // dau danh thuc mat 20-30s, du de khach bam nut gui form ma khong thay
  // phan hoi. Danh thuc som ngay khi mo web (truoc khi khach cuon xuong
  // toi form) de luc bam gui backend da san sang.
  useEffect(() => {
    fetch('/api/leads', { method: 'GET' }).catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
