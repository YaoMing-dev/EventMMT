export default function StatsBar({ items }) {
  return (
    <div className="stats">
      <div className="row">
        {items.map((item, i) => (
          <div className="stat rv" key={i}>
            <b>{item.value}</b>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
