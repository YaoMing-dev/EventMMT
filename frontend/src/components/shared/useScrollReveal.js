import { useEffect } from 'react'

// Không dùng IntersectionObserver: quan sát thực tế cho thấy callback của nó
// có thể không bao giờ bắn (tab nền, throttling của trình duyệt…) — khi đó
// các khối `.rv` kẹt vĩnh viễn ở opacity:0, cả trang trông như trắng xoá dù
// nội dung vẫn còn nguyên trong DOM. Tính toán vị trí cuộn trực tiếp không
// phụ thuộc vào việc trình duyệt có chịu bắn sự kiện hay không.
function isNearViewport(el) {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0
}

export default function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'))
      return undefined
    }

    let pending = Array.from(document.querySelectorAll('.rv'))

    const reveal = () => {
      pending = pending.filter((el) => {
        if (!isNearViewport(el)) return true
        el.classList.add('in')
        return false
      })
      if (pending.length === 0) {
        window.removeEventListener('scroll', reveal)
        window.removeEventListener('resize', reveal)
      }
    }

    reveal()
    window.addEventListener('scroll', reveal, { passive: true })
    window.addEventListener('resize', reveal)
    return () => {
      window.removeEventListener('scroll', reveal)
      window.removeEventListener('resize', reveal)
    }
  }, [])
}
