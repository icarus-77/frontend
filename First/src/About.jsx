// Child component - receives data from parent via props
function About({ data }) {
  return (
    <section className="text-page narrow-page">
      <p className="eyebrow">{data.eyebrow}</p>
      <h1>{data.title}</h1>
      <p className="intro">
        {data.content}
      </p>
      <p>
        {data.extraContent}
      </p>
    </section>
  )
}

export default About