  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPage from './pages/Mainpage'
import Product from './pages/Product'
import Schedule from './pages/Schedule'
import SearchTicket from './pages/SearchTicket'
import News from './pages/News'
import Invoice from './pages/Invoice'
import Contact from './pages/Contact'
import About from './pages/About'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/product" element={<Product />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/search-ticket" element={<SearchTicket />} />
        <Route path="/news" element={<News />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  )
}

export default App
