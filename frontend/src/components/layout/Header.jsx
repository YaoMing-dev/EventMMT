import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header({ view }) {
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
        ['#tongmau', 'Bộ sưu tập'],
        ['#banggia', 'Bảng giá'],
        ['#album', 'Album'],
        ['#lienhe-cuoi', 'Liên hệ'],
      ]

  return (
    <header role="banner">
      <div className="nav">
        <Link className="logo" to="/">
          <img className="mark" src="/logo.jpg" alt="MMT" />
          <span>
            <b>MMT {isEvent ? 'Event' : 'Wedding'}</b>
            <small>{isEvent ? 'Tổ chức sự kiện miền Tây' : 'by Minh Minh Thúy'}</small>
          </span>
        </Link>
        <nav>
          <ul>
            {links.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}
          </ul>
        </nav>
        <div className="nav-right">
          {isEvent ? (
            <Link className="crosslink" to="/tiec-cuoi">Tiệc cưới — Đám hỏi</Link>
          ) : (
            <Link className="crosslink" to="/su-kien">Sự kiện doanh nghiệp</Link>
          )}
          <a className="btn gold" href={isEvent ? '#lienhe' : '#lienhe-cuoi'}>Nhận báo giá</a>
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
            <Link className="crosslink" to="/tiec-cuoi" onClick={() => setMenuOpen(false)}>Tiệc cưới — Đám hỏi</Link>
          ) : (
            <Link className="crosslink" to="/su-kien" onClick={() => setMenuOpen(false)}>Sự kiện doanh nghiệp</Link>
          )}
        </div>
      )}
    </header>
  )
}
