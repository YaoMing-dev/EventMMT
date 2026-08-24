import { useState, useRef, useEffect } from 'react'
import { contactInfo } from '../../data/contactInfo.js'

const GREETING = {
  event: 'Chào bạn! Mình là trợ lý tư vấn của MMT Event. Bạn cần hỗ trợ về tổ chức sự kiện, khai trương, hội nghị hay thuê thiết bị?',
  wedding: 'Chào bạn! Mình là trợ lý tư vấn của Minh Minh Thúy. Bạn cần hỗ trợ về lễ cưới hỏi nào ạ?',
}

const FALLBACK_REPLY = 'Xin lỗi, hệ thống tư vấn đang bận. Bạn nhắn Zalo giúp mình để được hỗ trợ ngay nhé!'

// Cung mot kieu retry-1-lan nhu postLead trong ContactForm — Render free co
// the vua thuc day tu ngu, lan goi dau doi khi rot mang.
async function postChat(payload) {
  try {
    return await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    return fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
}

export default function ChatWidget({ view }) {
  const info = contactInfo[view] ?? contactInfo.event
  const pageContext = view === 'wedding' ? 'WEDDING' : 'EVENT'
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'model', text: GREETING[view] ?? GREETING.event }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userTurn = { role: 'user', text }
    // messages[0] la loi chao sinh cuc bo, khong gui len Gemini lam ngu canh.
    const apiHistory = [...messages.slice(1), userTurn]
    setMessages((current) => [...current, userTurn])
    setInput('')
    setLoading(true)

    try {
      const response = await postChat({ pageContext, history: apiHistory })
      if (response.ok) {
        const data = await response.json()
        setMessages((current) => [...current, { role: 'model', text: data.reply }])
      } else {
        setMessages((current) => [...current, { role: 'model', text: FALLBACK_REPLY }])
      }
    } catch {
      setMessages((current) => [...current, { role: 'model', text: FALLBACK_REPLY }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatw">
      <button
        type="button"
        className="chatw-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng chat tư vấn' : 'Mở chat tư vấn'}
      >
        {open ? '✕' : 'Chat'}
      </button>

      {open && (
        <div className="chatw-panel">
          <div className="chatw-head">Tư vấn {info.brand}</div>
          <div className="chatw-list" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatw-msg ${m.role}`}>{m.text}</div>
            ))}
            {loading && <div className="chatw-msg model chatw-typing">Đang nhập...</div>}
          </div>
          <form className="chatw-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              aria-label="Nhập câu hỏi cho chatbot"
            />
            <button type="submit" disabled={loading || !input.trim()}>Gửi</button>
          </form>
        </div>
      )}
    </div>
  )
}
