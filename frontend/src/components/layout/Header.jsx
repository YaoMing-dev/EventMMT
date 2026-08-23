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
