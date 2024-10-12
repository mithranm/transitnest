import React from 'react';

const PropertyList = ({ properties }) => {
  return (
    <div className="space-y-4">
      {properties.map(property => (
        <div className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold">{property.address}</h3>
          <p>Est. payment: ${property.rental_price}/mo</p>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;