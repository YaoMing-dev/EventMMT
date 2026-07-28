import { contactInfo } from '../../data/contactInfo.js'

export default function RailButtons({ view }) {
  const info = contactInfo[view] ?? contactInfo.event
  return (
    <div className="rail">
      <a className="call" href={`tel:${info.phone}`} title="Gọi ngay" aria-label="Gọi ngay">Gọi</a>
      <a className="zalo" href={info.zaloUrl} target="_blank" rel="noopener noreferrer" title="Chat Zalo">Zalo</a>
      <a className="fb" href={info.facebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook">f</a>
    </div>
  )
}
