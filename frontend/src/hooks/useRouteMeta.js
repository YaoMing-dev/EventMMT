import { useEffect } from 'react'

/**
 * Cập nhật title/description/canonical có sẵn trong index.html thay vì
 * chèn thêm thẻ mới — chèn thêm sẽ để lại 2 thẻ canonical/description
 * xung đột nhau trong <head> vì SPA dùng chung một document.
 */
export default function useRouteMeta({ title, description, canonical }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const descriptionEl = document.querySelector('meta[name="description"]')
    const previousDescription = descriptionEl?.getAttribute('content')
    descriptionEl?.setAttribute('content', description)

    const canonicalEl = document.querySelector('link[rel="canonical"]')
    const previousCanonical = canonicalEl?.getAttribute('href')
    canonicalEl?.setAttribute('href', canonical)

    return () => {
      document.title = previousTitle
      if (previousDescription !== undefined) descriptionEl?.setAttribute('content', previousDescription)
      if (previousCanonical !== undefined) canonicalEl?.setAttribute('href', previousCanonical)
    }
  }, [title, description, canonical])
}
