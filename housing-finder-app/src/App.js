import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HousingFinderApp from './components/HousingFinderApp';

// Home component
const Home = () => (
  <div className="container mx-auto mt-4">
    <h1 className="text-2xl font-bold">Welcome to TransitNest</h1>
    <p className="mt-2">Find your perfect home with our Housing Finder tool.</p>
  </div>
);

// About component
const About = () => (
  <div className="container mx-auto mt-4">
    <h1 className="text-2xl font-bold">About TransitNest</h1>
    <p className="mt-2">TransitNest is a platform designed to help you find housing options that suit your needs and budget.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <header className="bg-gray-800 text-white p-4">
          <h1 className="text-2xl font-bold text-center">Perspire</h1>
          <nav className="mt-4">
            <ul className="flex justify-center space-x-4">
              <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
              <li><Link to="/TransitNest" className="hover:text-gray-300">TransitNest</Link></li>
              <li><Link to="/contact-us" className="hover:text-gray-300">Contact Us</Link></li>
            </ul>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/TransitNest" element={<HousingFinderApp />} />
            <Route path="/contact-us" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;