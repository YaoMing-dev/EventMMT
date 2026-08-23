import { useEffect } from 'react'

/**
 * Hiện dần các khối tĩnh (`.len`, `.moc`) bên trong `rootRef`.
 *
 * Tách khỏi `useScrollReveal` dùng chung vì trang cưới hỏi dùng lớp `hien`
 * của bộ CSS riêng, không phải lớp `in` của global.css — và chỉ quét trong
 * phạm vi trang, không quét cả document.
 *
 * Lưới ảnh không dùng hook này: nó phải bật hiện cả loạt khi đổi bộ lọc,
 * nên trạng thái đó nằm trong state của WorkGallery.
 */
export default function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const targets = Array.from(root.querySelectorAll('.len, .moc'))

    // Không có IntersectionObserver, hoặc người dùng tắt hiệu ứng: hiện thẳng.
    // Thiếu nhánh này thì cả trang nằm ở opacity 0 — trắng trang, không phải
    // mất hiệu ứng.
    if (
      typeof IntersectionObserver === 'undefined'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      targets.forEach((el) => el.classList.add('hien'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hien')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [rootRef])
}
