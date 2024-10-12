import React, { useState } from 'react';
import { Map } from 'lucide-react';
import SearchForm from './SearchForm';
import PropertyList from './PropertyList';
import ChatAssistant from './ChatAssistant';

const HousingFinderApp = () => {
  const [searchParams, setSearchParams] = useState({
    budget: '',
    creditScore: '',
    maxDistance: '',
    loanTerm: '',
    workZip: ''
  });
  const [properties, setProperties] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  const handleSearch = (params) => {
    setSearchParams(params);
    // Here you would typically make an API call to fetch properties
    // For now, we'll just set a dummy property
    setProperties([
      {
        id: 1,
        address: '123 Main St',
        price: 300000,
        distanceToWork: 5.2,
        distanceToTransit: 0.3,
        estimatedPayment: 1500
      }
    ]);
  };

  const handleChatMessage = (message) => {
    setChatMessages([...chatMessages, { text: message, sender: 'user' }]);
    // Here you would typically make an API call to get a response
    // For now, we'll just add a dummy response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        text: "I'm happy to provide more information. What would you like to know?", 
        sender: 'assistant' 
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Housing Finder</h1>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/3 flex flex-col">
          <div className="p-4 overflow-y-auto flex-grow">
            <SearchForm onSearch={handleSearch} />
            <PropertyList properties={properties} />
          </div>
          <ChatAssistant messages={chatMessages} onSendMessage={handleChatMessage} />
        </div>
        
        <div className="w-2/3 bg-gray-200 flex items-center justify-center">
          <Map size={48} />
          <span className="ml-2">Map would be displayed here</span>
        </div>
      </main>
    </div>
  );
};

export default HousingFinderApp;