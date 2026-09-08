import { House } from 'lucide-react'

const Navbar = () => {
  return (
    <nav>
      <h1>
        <House size={20} className="navbar-icon" aria-hidden="true" />
        My App
      </h1>
      <div>
        <a href="#home">Home</a>
        <a href="#about">About</a>
      </div>
    </nav>
  )
}

export default Navbar
