import { useEffect } from 'react'
import useRouteMeta from '../../hooks/useRouteMeta.js'

// Bản tổng quát của EventSchema/WeddingSchema cho các trang dịch vụ con —
// cùng cách xử lý: cập nhật title/description/canonical có sẵn thay vì
// chèn thêm, và tái sử dụng script JSON-LD đã được prerender (nếu có)
// thay vì tạo bản thứ hai.
export default function SubPageMeta({ meta, schemas, tag }) {
  useRouteMeta(meta)

  useEffect(() => {
    const nodes = schemas.map((schema, i) => {
      const dataTag = `${tag}-${i}`
      const script = document.querySelector(`script[data-mmt="${dataTag}"]`)
        ?? (() => {
          const el = document.createElement('script')
          el.type = 'application/ld+json'
          el.setAttribute('data-mmt', dataTag)
          document.head.appendChild(el)
          return el
        })()
      script.textContent = JSON.stringify(schema)
      return script
    })

    return () => nodes.forEach((node) => node.remove())
  }, [tag, schemas])

  return null
}
