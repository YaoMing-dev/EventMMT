import { Link } from 'react-router-dom'
import useScrollReveal from '../shared/useScrollReveal.js'
import SubPageMeta from '../shared/SubPageMeta.jsx'
import Breadcrumbs from '../shared/Breadcrumbs.jsx'
import ContactForm from '../shared/ContactForm.jsx'
import { contactInfo } from '../../data/contactInfo.js'
import { eventServiceRouteMeta, eventServiceSchemas } from '../../data/eventServicePages.js'

const event = contactInfo.event

export default function EventServicePage({ page }) {
  useScrollReveal()

  const crumbs = [{ label: 'Trang chủ', to: '/' }, ...page.breadcrumb, { label: page.schemaName, to: page.path }]

  return (
    <main>
      <SubPageMeta
        meta={eventServiceRouteMeta(page)}
        schemas={eventServiceSchemas(page)}
        tag={`svc-event-${page.slug}`}
      />

      <section className="blk" style={{ paddingBottom: 0 }}>
        <Breadcrumbs items={crumbs} />
        <div className="sec-head rv">
          <span className="eyebrow">{page.kicker}</span>
          <h1>{page.h1}</h1>
          {page.intro.map((p) => <p key={p}>{p}</p>)}
        </div>

        <div className="card-ph rv" style={{ marginBottom: 40 }}>
          <div className="img">
            <img src={page.image.src} alt={page.image.alt} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        <ul className="ev-danh-muc rv">
          {page.includes.map((item) => <li key={item}>{item}</li>)}
        </ul>

        {page.gallery?.length > 0 && (
          <div className="svc-anh rv">
            {page.gallery.map((img) => (
              <img key={img.src} src={img.src} alt={img.alt} loading="lazy" decoding="async" />
            ))}
          </div>
        )}
      </section>

      <section className="blk" id="lienhe">
        <div className="contact">
          <div className="info rv">
            <span className="eyebrow">Liên hệ</span>
            <h2>Nhận báo giá cho hạng mục này</h2>
            <p>Gửi thông tin ngắn gọn — MMT phản hồi qua Zalo trong 15 phút giờ hành chính và gửi báo giá chi tiết trong 24 giờ.</p>
            <div className="big">{event.phoneDisplay}</div>
            <p>Hotline kiêm Zalo · {event.contactName} · Cần Thơ &amp; các tỉnh miền Tây</p>
          </div>
          <ContactForm variant="event" />
        </div>
      </section>

      <section className="blk" style={{ paddingTop: 0 }}>
        <div className="promo rv">
          <div><h3>Xem thêm hạng mục khác</h3><p>{page.related.label}.</p></div>
          <Link className="go" to={page.related.to}>{page.related.label} →</Link>
        </div>
      </section>
    </main>
  )
}
