export default function Quotes({ items }) {
  return (
    <section className="blk" style={{ paddingTop: 0 }}>
      <div className="quotes rv">
        {items.map((item, i) => (
          <div className="quote" key={i}>
            <p>{item.text}</p>
            <div className="who"><b>{item.name}</b>{item.meta}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
