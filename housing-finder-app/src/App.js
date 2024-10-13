import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HousingFinderApp from './components/HousingFinderApp';

// Home component
const Home = () => (
  <div className="container mx-auto mt-8 px-4">
    <h1 className="text-3xl font-bold text-center">Welcome to TransitNest</h1>
    <p className="mt-4 text-center text-lg">
      Find your perfect home with our Housing Finder tool.
    </p>
  </div>
);

// About component
const About = () => (
  <div className="container mx-auto mt-8 px-4">
    <h1 className="text-3xl font-bold text-center">About TransitNest</h1>
    <p className="mt-4 text-center text-lg">
      TransitNest is a platform designed to help you find housing options that suit your needs and budget.
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="flex flex-col h-full font-serif['Roboto']">
        {/* Header */}
        <header className="bg-gray-800 text-white p-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-left">TransitNest</h1>
          <nav className="mt-2">
            <ul className="flex justify-end space-x-6">
              <li>
                <Link
                  to="/"
                  className="hover:text-gray-300 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/TransitNest"
                  className="hover:text-gray-300 transition-colors duration-200"
                >
                  Housing Finder
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-gray-300 transition-colors duration-200"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/TransitNest" element={<HousingFinderApp />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white p-4 text-center flex-shrink-0">
          &copy; {new Date().getFullYear()} TransitNest. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
