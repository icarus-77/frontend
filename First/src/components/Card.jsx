import { ArrowRight } from 'lucide-react'

const Card = () => {
  return (
    <article>
      <h2>Placeholder Card</h2>
      <p>This is a reusable card component for your content.</p>
      <button type="button">
        Learn More
        <ArrowRight size={18} className="card-action-icon" aria-hidden="true" />
      </button>
    </article>
  )
}

export default Card
