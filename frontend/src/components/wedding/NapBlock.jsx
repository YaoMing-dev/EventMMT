import { contactInfo } from '../../data/contactInfo.js'

const wedding = contactInfo.wedding

export default function NapBlock() {
  return (
    <section className="khoi nen-2" id="lien-he">
      <div className="truc">
        <div className="doi-xung">
          <div className="gach-doi"><span>Liên hệ</span></div>
          <h2 className="de">Ghé xem trực tiếp</h2>
        </div>

        <dl className="nap len">
          <div className="o-nap">
            <dt>Địa chỉ</dt>
            <dd>{wedding.street}<br />{wedding.locality}</dd>
          </div>
          <div className="o-nap">
            <dt>Điện thoại</dt>
            <dd>
              <a href={`tel:${wedding.phoneIntl}`}>{wedding.phoneDisplay}</a>
            </dd>
          </div>
          <div className="o-nap">
            <dt>Giờ mở cửa</dt>
            <dd>Thứ Hai – Chủ Nhật<br />{wedding.hoursOpen.replace(/^0/, '')} – {wedding.hoursClose}</dd>
          </div>
          <div className="o-nap">
            <dt>Trên bản đồ</dt>
            <dd>
              <a href={wedding.mapsUrl} target="_blank" rel="noopener noreferrer">Mở Google Maps</a><br />
              <a href={wedding.facebookUrl} target="_blank" rel="noopener noreferrer">Trang Facebook</a><br />
              <a href={`mailto:${wedding.email}`}>{wedding.email}</a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
