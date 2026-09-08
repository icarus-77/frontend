// import './App.css'
// import Navbar from './components/Navbar'
// import Card from './components/Card'

// const App = () => {
//   return (
//     <div>
//       <Navbar />
//       <main>
//         <h1>This is Home Page</h1>
//         <Card />
//       </main>
//     </div>
//   )
// }

// export default App
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Home from './home'
import About from './About'
import Contact from './Contact'
import './App.css'

// Parent component - data is passed down to child components via props
function Layout() {
  // Data defined in parent component
  const homeData = {
    eyebrow: 'Welcome',
    title: 'A quiet place for clear ideas.',
    content: 'Northstar is a small space for thoughtful work, useful notes, and meaningful connections.',
    link: { text: 'Read about Northstar', path: '/about' }
  }

  const aboutData = {
    eyebrow: 'About',
    title: 'Made with intention.',
    content: 'Northstar is built around a simple belief: good work becomes easier when there is room to think, make, and return to what matters.',
    extraContent: 'This site is a starting point for sharing projects, writing, and the ideas behind them.'
  }

  const contactData = {
    eyebrow: 'Contact',
    title: 'Let\'s start a conversation.',
    content: 'For questions, collaborations, or a simple hello, write to',
    email: 'hello@northstar.example'
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="site-name" to="/">Northstar</Link>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      <main className="page-content">
        <Routes>
          {/* Parent passes data to child components as props */}
          <Route path="/" element={<Home data={homeData} />} />
          <Route path="/about" element={<About data={aboutData} />} />
          <Route path="/contact" element={<Contact data={contactData} />} />
        </Routes>
      </main>

      <footer className="site-footer">Northstar / 2026</footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App