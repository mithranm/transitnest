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
    <form onSubmit={handleSubmit} className="searchForm mb-4 grid grid-cols-2 gap-2">
      <label>Budget</label>
      <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="Budget" className="p-2 border rounded" />
      <label>Preferred distance</label>
      <input type="number" name="maxDistance" value={formData.maxDistance} onChange={handleChange} placeholder="Max Distance (mi)" className="p-2 border rounded" />
      <label>Work zipcode</label>
      <input type="text" name="workZip" value={formData.workZip} onChange={handleChange} placeholder="Work Zip" className="p-2 border rounded" />
      <button type="submit" className="submission_button rounded">
        Search
      </button>
    </form>
  );
};

export default SearchForm;