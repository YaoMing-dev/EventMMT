import { Link } from 'react-router-dom'

// items: [{ label, to }] — mục cuối là trang hiện tại, không có link.
export default function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={item.to}>
            {i > 0 && <span aria-hidden="true"> / </span>}
            {isLast ? <span aria-current="page">{item.label}</span> : <Link to={item.to}>{item.label}</Link>}
          </span>
        )
      })}
    </nav>
  )
}
