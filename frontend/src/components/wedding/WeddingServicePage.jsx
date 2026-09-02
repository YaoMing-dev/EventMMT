import { Link } from 'react-router-dom'
import SubPageMeta from '../shared/SubPageMeta.jsx'
import Breadcrumbs from '../shared/Breadcrumbs.jsx'
import ContactForm from '../shared/ContactForm.jsx'
import useReveal from './useReveal.js'
import { contactInfo } from '../../data/contactInfo.js'
import { weddingServiceRouteMeta, weddingServiceSchemas } from '../../data/weddingServicePages.js'
import { useRef } from 'react'

const wedding = contactInfo.wedding

export default function WeddingServicePage({ page }) {
  const rootRef = useRef(null)
  useReveal(rootRef)

  const crumbs = [{ label: 'Trang chủ', to: '/' }, ...page.breadcrumb, { label: page.schemaName, to: page.path }]

  return (
    <main className="mmt-mt" ref={rootRef}>
      <SubPageMeta
        meta={weddingServiceRouteMeta(page)}
        schemas={weddingServiceSchemas(page)}
        tag={`svc-wedding-${page.slug}`}
      />

      <section className="khoi">
        <div className="truc">
          <Breadcrumbs items={crumbs} />
          <div className="doi-xung">
            <div className="gach-doi"><span>{page.kicker}</span></div>
            <h1 className="de">{page.h1}</h1>
            <p className="de-phu">{page.intro[0]}</p>
          </div>

          {page.intro.slice(1).map((p) => (
            <p key={p} style={{ maxWidth: '58ch', margin: '18px auto 0', textAlign: 'center', color: 'var(--muc-nhat)', fontSize: 15 }}>{p}</p>
          ))}

          <ul className="viec" style={{ maxWidth: 420, margin: '32px auto 0' }}>
            {page.includes.map((item) => <li key={item}>{item}</li>)}
          </ul>

          {page.photos?.length > 0 && (
            <div className="foto-doi">
              {page.photos.map((img) => (
                <img key={img.src} src={img.src} alt={img.alt} loading="lazy" decoding="async" />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="khoi nen-2" id="lien-he">
        <div className="truc">
          <div className="doi-xung">
            <div className="gach-doi"><span>Liên hệ</span></div>
            <h2 className="de">Nhận báo giá cho hạng mục này</h2>
            <p className="de-phu">Gửi thông tin ngắn gọn — {wedding.contactName} gọi lại trong ngày.</p>
          </div>
          <div className="dat len" style={{ marginTop: 40 }}>
            <div className="loi">
              <div className="nut-hang">
                <a className="nut dam" href={`tel:${wedding.phoneIntl}`}>{wedding.phoneDisplay}</a>
                <a className="nut" href={wedding.zaloUrl} target="_blank" rel="noopener noreferrer">Nhắn Zalo</a>
              </div>
            </div>
            <ContactForm variant="wedding" />
          </div>
        </div>
      </section>

      <div className="truc">
        <div className="re len">
          <div>
            <h3>Xem thêm hạng mục khác</h3>
            <p>{page.related.label}.</p>
          </div>
          <Link to={page.related.to}>{page.related.label} →</Link>
        </div>
      </div>
    </main>
  )
}
