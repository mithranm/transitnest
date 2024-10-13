import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <nav className="bg-light-blue-500 text-white whitespace-nowrap">
      <div className="container mx-auto flex items-center justify-center space-x-6 py-4">
        <Link to="/" className="font-bold text-2xl hover:text-gray-300 transition-colors duration-200">
          BrandName
        </Link>
        <Link to="/TransitNest" className="px-4 py-2 hover:text-gray-300 transition-colors duration-200">
          TransitNest
        </Link>
        <Link to="/about" className="px-4 py-2 hover:text-gray-300 transition-colors duration-200">
          About
        </Link>
      </div>
    </nav>
  );
};

export default NavigationBar;
