import React from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import HousingFinderApp from "./components/HousingFinderApp";

// Home component
const Home = () => (
  <div className="container mx-auto mt-8 px-4">
    <h1 className="text-3xl font-bold text-center tracking-wide">
      Welcome to TransitNest
    </h1>
    <div>
      <p className="mt-4 text-lg text-left">
        At TransitNest, we make finding your ideal home easy, affordable, and
        convenient. Whether you're searching for a new apartment, condo, or
        house, our Housing Finder Tool is designed to help you discover the
        perfect home that matches both your budget and your commuting needs.
      </p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">With TransitNest, you can:</p>
    </div>
    <div className="grid grid-cols-11">
      <p className="text-5xl p-5">🏠</p>
      <p className="mt-4 text-left text-lg col-span-10">
        Discover Homes Near Public Transit: Find housing located close to major
        public transportation networks like WMATA, Fairfax Connector, Loudoun
        Transit, and MTA. Say goodbye to long, stressful commutes and find a
        home that keeps you well-connected to your city.
      </p>
    </div>
    <div className="grid grid-cols-11">
      <p className="text-5xl p-5">🔎</p>
      <p className="mt-4 text-left text-lg col-span-10">
        Tailor Your Search to Your Budget: We understand how important
        affordability is. Our advanced filters allow you to customize your
        search by budget, distance from your workplace, and proximity to transit
        stops—ensuring you only see options that fit your needs.
      </p>
    </div>
    <div className="grid grid-cols-11">
      <p className="text-5xl p-5">🚈</p>
      <p className="mt-4 text-left text-lg col-span-10">
        Real-Time Transit Integration: With access to live data from local
        transit systems, you can view transit routes and schedules directly on
        the map, giving you a clear picture of how easy it will be to get to
        work, school, or anywhere else you need to go.
      </p>
    </div>
    <div className="grid grid-cols-11">
    <p className="text-5xl p-5">📍</p>
      <p className="mt-4 text-left text-lg col-span-10">
        Interactive Maps for Smart Decisions: Our intuitive, interactive map
        lets you visualize housing options, nearby public transit, and key
        amenities, so you can confidently choose a neighborhood that fits your
        lifestyle.
      </p>
    </div>
  </div>
);

// About component
const About = () => (
  <div className="container mx-auto mt-8 px-4">
    <h1 className="text-3xl font-bold text-center">About TransitNest</h1>
    <p className="mt-4 text-left text-lg"></p>
    <div>
      <p className="mt-4 text-left text-lg">
        TransitNest is a comprehensive platform designed to help individuals and
        families find affordable housing options near major public
        transportation networks, such as WMATA, Fairfax Connector, Loudoun
        Transit, and MTA. We recognize that the daily commute is an important
        factor in choosing a place to live. Our goal is to ensure you find a
        home that fits both your budget and commuting preferences, so you can
        enjoy affordable living with convenient access to public transportation.
      </p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">
        By combining advanced search filters, interactive mapping, and transit
        data, TransitNest allows you to explore housing options in the
        Washington D.C. metropolitan area and beyond with ease. Whether you're
        looking for an apartment close to your office or a house in a quieter
        suburb with excellent transit connectivity, TransitNest makes the
        process simple and effective.
      </p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">How to Use TransitNest</p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">🔎 Enter Your Search Criteria 🔎</p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">
        Budget: Input your maximum housing budget (e.g., $2000 for rent). This
        will help you filter out properties that exceed your financial limits,
        so you can focus on homes you can afford.
      </p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">
        Preferred Distance: Enter the maximum distance you’re willing to travel
        from your home to your workplace or nearest transit hub. This allows the
        platform to show properties that are within a reasonable commuting
        distance based on your preferences.
      </p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">
        Work Zip Code: Input your work location’s zip code (e.g., 20105). This
        ensures that TransitNest focuses on housing options with easy access to
        transit lines or routes that connect to your work location, making your
        daily commute smoother and faster.
      </p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">✅ Click "Search" ✅</p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">
        After entering your criteria, click the Search button. TransitNest will
        search its housing database and provide a list of available properties
        that meet your budget, distance preferences, and proximity to your work
        location.
      </p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">🗺️ Explore the Interactive Map 🗺️</p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">
        Once you’ve clicked "Search," TransitNest displays housing options as
        markers on the interactive map. You can zoom in and out to explore
        different neighborhoods and get a better sense of the properties’
        locations relative to public transportation routes.
      </p>
    </div>
    <div>
      <p className="mt-4 text-left text-lg">
        Map View: Switch between different views, including "Map" (default) and
        "Satellite," to get a clearer idea of the area around potential homes.
        The map will also display nearby bus stops, metro stations, and transit
        routes, helping you visualize your daily commute.
      </p>
    </div>
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
          &copy; {new Date().getFullYear()} TransitNest
        </footer>
      </div>
    </Router>
  );
}

export default App;
