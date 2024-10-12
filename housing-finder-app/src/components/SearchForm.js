import React, { useState } from 'react';

const SearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    budget: '',
    creditScore: '',
    maxDistance: '',
    loanTerm: '',
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
    <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-2 gap-2">
      <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="Budget" className="p-2 border rounded" />
      <input type="number" name="creditScore" value={formData.creditScore} onChange={handleChange} placeholder="Credit Score" className="p-2 border rounded" />
      <input type="number" name="maxDistance" value={formData.maxDistance} onChange={handleChange} placeholder="Max Distance (mi)" className="p-2 border rounded" />
      <select name="loanTerm" value={formData.loanTerm} onChange={handleChange} className="p-2 border rounded">
        <option value="">Loan Term</option>
        <option value="15">15 years</option>
        <option value="30">30 years</option>
      </select>
      <input type="text" name="workZip" value={formData.workZip} onChange={handleChange} placeholder="Work Zip" className="p-2 border rounded" />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
        Search
      </button>
    </form>
  );
};

export default SearchForm;