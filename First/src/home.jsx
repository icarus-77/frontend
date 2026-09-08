import { Link } from 'react-router-dom'

// Child component - receives data from parent via props
function Home({ data }) {
  return (
    <section className="text-page">
      <p className="eyebrow">{data.eyebrow}</p>
      <h1>{data.title}</h1>
      <p className="intro">
        {data.content}
      </p>
      <Link className="text-link" to={data.link.path}>{data.link.text} -&gt;</Link>
    </section>
  )
}

export default Home