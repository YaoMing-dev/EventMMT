export default function ProcessSteps({ id, title, steps }) {
  return (
    <section className="blk" id={id} style={{ paddingTop: 0 }}>
      <div className="sec-head center rv">
        <span className="eyebrow">Quy trình</span>
        {title}
      </div>
      <div className="steps rv">
        {steps.map((step, i) => (
          <div className="step" key={i}>
            <span className="no">{step.no}</span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
