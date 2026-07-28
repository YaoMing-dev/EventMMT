export default function ProjectsList() {
  const projects = [
    { no: '01', title: 'Lễ ra quân VNPT Cần Thơ', meta: 'Nghi lễ · Nhà bạt · Sân khấu · 2025' },
    { no: '02', title: 'Mở bán dự án Nam Long', meta: 'Ngoài trời · Nhà bạt đôi · 800 khách · 2025' },
    { no: '03', title: 'Động thổ Cara Legend — Caragroup', meta: 'Nghi thức · Múa lân · Cổng chào · 2025' },
    { no: '04', title: 'Hội nghị công nghệ ĐH Nam Cần Thơ', meta: 'Hội nghị · LED · Đại biểu · 2024' },
  ]
  return (
    <section className="blk" id="duan" style={{ paddingTop: 0 }}>
      <div className="sec-head rv">
        <span className="eyebrow">Dự án tiêu biểu</span>
        <h2>Những dấu mốc chúng tôi <em>dựng nên</em></h2>
      </div>
      <div className="projects rv">
        {projects.map((p) => (
          <div className="proj" key={p.no}>
            <span className="no">{p.no}</span>
            <div><h3>{p.title}</h3><div className="meta">{p.meta}</div></div>
            <span className="view">Xem dự án →</span>
          </div>
        ))}
      </div>
    </section>
  )
}
