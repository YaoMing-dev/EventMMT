import { useState } from 'react'

export default function AdminPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [leads, setLeads] = useState(null)
  const [error, setError] = useState('')

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
    } catch {
      setError('Không kết nối được tới server')
    }
  }

  if (leads) {
    return (
      <main style={{ padding: 40, maxWidth: 1000, margin: '0 auto' }}>
        <h1>Danh sách yêu cầu báo giá</h1>
        <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Loại</th>
              <th>Hạng mục</th>
              <th>Ngày dự kiến</th>
              <th>Số khách</th>
              <th>Tông màu</th>
              <th>Điện thoại</th>
              <th>Tạo lúc</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.category}</td>
                <td>{lead.subtype}</td>
                <td>{lead.eventDate}</td>
                <td>{lead.guestCount ?? '—'}</td>
                <td>{lead.toneColor ?? '—'}</td>
                <td>{lead.phone}</td>
                <td>{lead.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    )
  }

  return (
    <main style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h1>Đăng nhập Admin</h1>
      <form onSubmit={handleLogin}>
        <label htmlFor="admin-username">Tài khoản</label>
        <input id="admin-username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <label htmlFor="admin-password">Mật khẩu</label>
        <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn gold" style={{ marginTop: 16 }}>Đăng nhập</button>
      </form>
      {error && <p style={{ color: 'var(--accent)' }}>{error}</p>}
    </main>
  )
}
