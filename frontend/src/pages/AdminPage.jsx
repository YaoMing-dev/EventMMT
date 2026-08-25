import { useEffect, useState } from 'react'

// Khong cho cong cu tim kiem index trang nay du link co bi lo o dau do —
// cung mot kieu voi WeddingSchema.jsx nhung go ra khi roi trang.
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'robots')
    meta.setAttribute('content', 'noindex, nofollow')
    meta.setAttribute('data-mmt', 'admin')
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
}

function formatCreatedAt(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function AdminPage() {
  useNoIndex()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [leads, setLeads] = useState(null)
  const [error, setError] = useState('')
  const [authHeader, setAuthHeader] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const credentials = btoa(`${username}:${password}`)
    try {
      const response = await fetch('/api/admin/leads', {
        headers: { Authorization: `Basic ${credentials}` },
      })
      if (response.status === 401) {
        setError('Sai tài khoản hoặc mật khẩu')
        setLeads(null)
        return
      }
      const data = await response.json()
      setLeads(data)
      setAuthHeader(`Basic ${credentials}`)
    } catch {
      setError('Không kết nối được tới server')
    }
  }

  function handleLogout() {
    setLeads(null)
    setAuthHeader('')
    setUsername('')
    setPassword('')
    setError('')
  }

  async function handleDelete(id) {
    if (!window.confirm('Xoá yêu cầu này?')) return
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      })
      if (response.ok) {
        setLeads((current) => current.filter((lead) => lead.id !== id))
      } else {
        setError('Không xoá được — thử lại sau.')
      }
    } catch {
      setError('Không kết nối được tới server')
    }
  }

  if (leads) {
    const total = leads.length
    const eventCount = leads.filter((l) => l.category === 'EVENT').length
    const weddingCount = leads.filter((l) => l.category === 'WEDDING').length
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentCount = leads.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).length

    return (
      <main className="admin-wrap">
        <div className="admin-topbar">
          <h1>Danh sách yêu cầu báo giá</h1>
          <button type="button" className="btn ghost" onClick={handleLogout}>Đăng xuất</button>
        </div>
        {error && <p className="note loi-nhap">{error}</p>}

        <div className="admin-stats">
          <div className="admin-stat">
            <b>{total}</b>
            <span>Tổng yêu cầu</span>
          </div>
          <div className="admin-stat">
            <b>{eventCount}</b>
            <span>Sự kiện</span>
          </div>
          <div className="admin-stat">
            <b>{weddingCount}</b>
            <span>Cưới hỏi</span>
          </div>
          <div className="admin-stat">
            <b>{recentCount}</b>
            <span>7 ngày qua</span>
          </div>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Hạng mục</th>
                  <th>Ngày dự kiến</th>
                  <th>Số khách</th>
                  <th>Tông màu</th>
                  <th>Điện thoại</th>
                  <th>Email</th>
                  <th>Tạo lúc</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <span className={`admin-badge admin-badge--${lead.category === 'WEDDING' ? 'wedding' : 'event'}`}>
                        {lead.category === 'WEDDING' ? 'Cưới hỏi' : 'Sự kiện'}
                      </span>
                    </td>
                    <td>{lead.subtype}</td>
                    <td>{lead.eventDate}</td>
                    <td>{lead.guestCount ?? '—'}</td>
                    <td>{lead.toneColor ?? '—'}</td>
                    <td><a href={`tel:${lead.phone}`}>{lead.phone}</a></td>
                    <td>{lead.email ?? '—'}</td>
                    <td>{formatCreatedAt(lead.createdAt)}</td>
                    <td>
                      <button type="button" className="admin-del-btn" onClick={() => handleDelete(lead.id)}>
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-login-wrap">
      <form className="cform admin-login-form" onSubmit={handleLogin}>
        <h1>Đăng nhập Admin</h1>
        <p className="admin-login-sub">Khu vực quản trị — chỉ dành cho nội bộ</p>
        <label htmlFor="admin-username">Tài khoản</label>
        <input id="admin-username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <label htmlFor="admin-password">Mật khẩu</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn gold">Đăng nhập</button>
        {error && <p className="note loi-nhap">{error}</p>}
      </form>
    </main>
  )
}
