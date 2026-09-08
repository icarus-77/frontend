// Child component - receives data from parent via props
function Contact({ data }) {
  return (
    <section className="text-page narrow-page">
      <p className="eyebrow">{data.eyebrow}</p>
      <h1>{data.title}</h1>
      <p className="intro">
        {data.content}
        <a className="text-link" href={`mailto:${data.email}`}>
          {data.email}
        </a>
      </p>
    </section>
  )
}

export default Contact