// src/components/PropertyList.js

import React from 'react';

const PropertyList = ({ properties }) => {
  return (
    <div className="space-y-4">
      {properties.map((property, index) => (
        <div 
          key={index} 
          className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow bg-white"
        >
          <h3 className="font-bold text-lg text-gray-800">
            {property.City}, {property.State} {property.ZIP}
          </h3>
          <p className="text-gray-600 mt-2">
            {property.travel_dist} | {property.duration_text} | ${property.RentPrice.toFixed(2)}/mo
          </p>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;
