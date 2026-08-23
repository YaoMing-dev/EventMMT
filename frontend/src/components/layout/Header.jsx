import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header({ view, theme, onToggleTheme }) {
  const isEvent = view === 'event'
  const [menuOpen, setMenuOpen] = useState(false)

  const links = isEvent
    ? [
        ['#quymo', 'Quy mô'],
        ['#duan', 'Dự án'],
        ['#dichvu', 'Dịch vụ'],
        ['#quytrinh', 'Quy trình'],
        ['#lienhe', 'Liên hệ'],
      ]
    : [
        ['#dich-vu', 'Dịch vụ'],
        ['#cong-trinh', 'Công trình'],
        ['#cach-dat', 'Cách đặt'],
        ['#lien-he', 'Liên hệ'],
      ]

  return (
    <header role="banner">
      <div className="nav">
        <Link className="logo" to="/">
          <img className="mark" src="/logo.jpg" alt="MMT" />
          <span>
            <b>{isEvent ? 'MMT Event' : 'Minh Minh Thúy'}</b>
            <small>{isEvent ? 'Tổ chức sự kiện miền Tây' : 'Cưới hỏi trọn gói · Cần Thơ'}</small>
          </span>
        </Link>
        <nav>
          <ul>
            {links.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}
          </ul>
        </nav>
        <div className="nav-right">
          {isEvent ? (
            <Link className="crosslink" to="/tiec-cuoi">Cưới hỏi — Minh Minh Thúy</Link>
          ) : (
            <Link className="crosslink" to="/su-kien">Sự kiện doanh nghiệp</Link>
          )}
          <button
            type="button"
            className="theme-toggle"
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            aria-pressed={theme === 'dark'}
            onClick={onToggleTheme}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              {theme === 'dark' ? (
                <path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.4 5.4 0 0 1-7.54-7.54c-.44-.06-.9-.1-1.36-.1Z" />
              ) : (
                <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4.2" />
                  <path d="M12 2.5v2.4M12 19.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7" />
                </g>
              )}
            </svg>
          </button>
          <a className="btn gold" href={isEvent ? '#lienhe' : '#cach-dat'}>Nhận báo giá</a>
        </div>
        <button
          className="menu-toggle"
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            {links.map(([href, label]) => (
              <li key={href}><a href={href} onClick={() => setMenuOpen(false)}>{label}</a></li>
            ))}
          </ul>
          {isEvent ? (
            <Link className="crosslink" to="/tiec-cuoi" onClick={() => setMenuOpen(false)}>Cưới hỏi — Minh Minh Thúy</Link>
          ) : (
            <Link className="crosslink" to="/su-kien" onClick={() => setMenuOpen(false)}>Sự kiện doanh nghiệp</Link>
          )}
        </div>
      )}
    </header>
  )
}
