import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPage from './pages/Mainpage'
import Product from './pages/Product'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/product" element={<Product />} />
      </Routes>
    </Router>
  )
}

export default App
