// src/components/SearchForm.js

import React, { useState } from 'react';

const SearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    budget: '',
    maxDistance: '',
    workZip: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-700 rounded-lg p-4 mb-4 grid grid-cols-2 gap-2">
      <label htmlFor="budget" className="text-white">
        Budget
      </label>
      <input 
        type="number" 
        name="budget" 
        id="budget" 
        value={formData.budget} 
        onChange={handleChange} 
        placeholder="Budget" 
        className="p-2 border border-gray-300 rounded" 
        required 
      />

      <label htmlFor="maxDistance" className="text-white">
        Preferred Distance
      </label>
      <input 
        type="number" 
        name="maxDistance" 
        id="maxDistance" 
        value={formData.maxDistance} 
        onChange={handleChange} 
        placeholder="Max Distance (mi)" 
        className="p-2 border border-gray-300 rounded" 
        required 
      />

      <label htmlFor="workZip" className="text-white">
        Work Zipcode
      </label>
      <input 
        type="text" 
        name="workZip" 
        id="workZip" 
        value={formData.workZip} 
        onChange={handleChange} 
        placeholder="Work Zip" 
        className="p-2 border border-gray-300 rounded" 
        required 
      />

      <button 
        type="submit" 
        className="
          bg-indigo-800 text-white 
          p-2 
          rounded-md 
          hover:bg-indigo-700 
          transition-colors duration-200 
          flex items-center justify-center
        "
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;
