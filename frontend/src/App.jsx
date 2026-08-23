import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import Topbar from './components/layout/Topbar.jsx'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import RailButtons from './components/layout/RailButtons.jsx'
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
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      {isSub && <Footer view={view} />}
      {isSub && <RailButtons view={view} />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
