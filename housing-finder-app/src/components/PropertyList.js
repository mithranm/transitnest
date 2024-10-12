import React from 'react';

const PropertyList = ({ properties }) => {
  return (
    <div className="space-y-4">
      {properties.map(property => (
        <div key={property.id} className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold">{property.address}</h3>
          <p>${property.price.toLocaleString()} | {property.distanceToWork} mi to work | {property.distanceToTransit} mi to transit</p>
          <p>Est. payment: ${property.estimatedPayment}/mo</p>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;