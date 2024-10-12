import React, { useState } from 'react';
import axios from 'axios';

const SearchForm = () => {
  const [formData, setFormData] = useState({
    budget: '',
    credit_score: '',
    dist_from_public_transport: '',
    length_of_loan: '',
    work_zipcode: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // type cast data to fit the datatype of backend
    console.log(formData);
    
    // getting a response from backend add functionality to the backend now.
    let response = axios.post("http://0.0.0.0:8000/house_search", formData)
    .then(function (response) {
      console.log(response);
    })
    .catch( function (error) {
      console.error(error);
    })

    // code here!
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-2 gap-2">
      <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="Budget" className="p-2 border rounded" />
      <input type="number" name="credit_score" value={formData.credit_score} onChange={handleChange} placeholder="Credit Score" className="p-2 border rounded" />
      <input type="number" name="dist_from_public_transport" value={formData.dist_from_public_transport} onChange={handleChange} placeholder="Max Distance (mi)" className="p-2 border rounded" />
      <select name="length_of_loan" value={formData.length_of_loan} onChange={handleChange} className="p-2 border rounded">
        <option value="">Loan Term</option>
        <option value="15">15 years</option>
        <option value="30">30 years</option>
      </select>
      <input type="text" name="work_zipcode" value={formData.work_zipcode} onChange={handleChange} placeholder="Work Zip" className="p-2 border rounded" />
      <button type="submit" className="submission_button rounded">
        Search
      </button>
    </form>
  );
};

export default SearchForm;