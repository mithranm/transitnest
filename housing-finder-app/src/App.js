import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HousingFinderApp from './components/HousingFinderApp';

// Home component
const Home = () => (
  <div className="container mx-auto mt-8 px-4">
    <h1 className="text-3xl font-bold text-center tracking-wide">Welcome to TransitNest</h1>
    <p className="mt-4 text-lg text-left">
    At TransitNest, we make finding your ideal home easy, affordable, and convenient. Whether you're searching for a new apartment, condo, or house, our Housing Finder Tool is designed to help you discover the perfect home that matches both your budget and your commuting needs.
    </p>
    <p className="mt-4 text-left text-lg">
      With TransitNest, you can:
    </p>
    <p className="mt-4 text-left text-lg">
    Discover Homes Near Public Transit: Find housing located close to major public transportation networks like WMATA, Fairfax Connector, Loudoun Transit, and MTA. Say goodbye to long, stressful commutes and find a home that keeps you well-connected to your city.
    </p>
    <p className="mt-4 text-left text-lg">
    Tailor Your Search to Your Budget: We understand how important affordability is. Our advanced filters allow you to customize your search by budget, distance from your workplace, and proximity to transit stops—ensuring you only see options that fit your needs.
    </p>
    <p className="mt-4 text-left text-lg">
    Real-Time Transit Integration: With access to live data from local transit systems, you can view transit routes and schedules directly on the map, giving you a clear picture of how easy it will be to get to work, school, or anywhere else you need to go.
    </p>
    <p className="mt-4 text-left text-lg">
    Interactive Maps for Smart Decisions: Our intuitive, interactive map lets you visualize housing options, nearby public transit, and key amenities, so you can confidently choose a neighborhood that fits your lifestyle.
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
      <div className="flex flex-col h-full font-serif">
        {/* Header */}
        <header className="bg-gray-800 text-white flex grid grid-cols-2 grid-rows-1 p-4">
          <h1 className="text-5xl text-left tracking-wider">TransitNest</h1>
          <nav className="mt-2">
            <ul className="flex justify-end space-x-6 text-2xl">
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
