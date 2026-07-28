import { useState } from 'react'
import { toneData, toneOrder, toneLabels } from '../../data/toneData.js'

export default function ToneSelector({ imagesByTone }) {
  const [active, setActive] = useState('son')
  const data = toneData[active]
  const images = imagesByTone[active] ?? []

  return (
    <>
      <div className="tone-selector rv">
        {toneOrder.map((key) => (
          <button
            key={key}
            className={`tone-btn${active === key ? ' active' : ''}`}
            onClick={() => setActive(key)}
          >
            <b>{toneLabels[key][0]}</b>
            <small>{toneLabels[key][1]}</small>
          </button>
        ))}
      </div>
      <div className="tone-display-card rv">
        <div className="tone-info">
          <span className="badge-tone">{data.badge}</span>
          <h3>{data.title}</h3>
          <p>{data.desc}</p>
          <div className="tone-features">
            <h4>Hạng mục đi kèm nổi bật:</h4>
            <ul>
              {data.list.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <a href="#lienhe-cuoi" className="btn gold">Giữ lịch tông màu này →</a>
        </div>
        <div className="tone-gallery">
          <div className="gal-item main">
            <img src={images[0]} alt="Bàn Gia Tiên" />
            <span className="gal-tag">Bàn Gia Tiên</span>
          </div>
          <div className="gal-item">
            <img src={images[1]} alt="Cổng hoa" />
            <span className="gal-tag">Cổng Hoa</span>
          </div>
          <div className="gal-item">
            <img src={images[2]} alt="Không gian tiệc" />
            <span className="gal-tag">Không Gian Tiệc</span>
          </div>
        </div>
      </div>
    </>
  )
}
