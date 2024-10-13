import React from 'react';

const PropertyList = ({ properties }) => {
  return (
    <div className="space-y-4">
      {properties.map(property => (
        <div className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold">{property.City}, {property.State} {property.ZIP}</h3>
          <p>{property.travel_dist} | {property.duration_text} | ${property.RentPrice.toFixed(2)}/mo</p>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;