import { useEffect } from 'react'

/**
 * Hiện dần các khối tĩnh (`.len`, `.moc`) bên trong `rootRef`.
 *
 * Tách khỏi `useScrollReveal` dùng chung vì trang cưới hỏi dùng lớp `hien`
 * của bộ CSS riêng, không phải lớp `in` của global.css — và chỉ quét trong
 * phạm vi trang, không quét cả document.
 *
 * Không dùng IntersectionObserver: quan sát thực tế cho thấy callback của nó
 * có thể không bao giờ bắn (tab nền, throttling của trình duyệt…) — khi đó
 * các khối kẹt vĩnh viễn ở opacity:0, cả trang trông như trắng xoá dù nội
 * dung vẫn còn nguyên trong DOM. Tính toán vị trí cuộn trực tiếp không phụ
 * thuộc vào việc trình duyệt có chịu bắn sự kiện hay không.
 *
 * Lưới ảnh không dùng hook này: nó phải bật hiện cả loạt khi đổi bộ lọc,
 * nên trạng thái đó nằm trong state của WorkGallery.
 */
function isNearViewport(el) {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0
}

export default function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.querySelectorAll('.len, .moc').forEach((el) => el.classList.add('hien'))
      return undefined
    }

    let pending = Array.from(root.querySelectorAll('.len, .moc'))

    const reveal = () => {
      pending = pending.filter((el) => {
        if (!isNearViewport(el)) return true
        el.classList.add('hien')
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
  }, [rootRef])
}
