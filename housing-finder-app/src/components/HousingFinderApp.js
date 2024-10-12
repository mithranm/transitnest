import React, { useState } from 'react';
import { Map } from 'lucide-react';
import SearchForm from './SearchForm';
import ChatAssistant from './ChatAssistant';

const HousingFinderApp = () => {
  const [chatMessages, setChatMessages] = useState([]);

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
      <header className="header">
        <h1 className="font-bold">TransitNest</h1>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        <div className="search_area w-1/3 flex flex-col">
          <div className="p-4 overflow-y-auto flex-grow">
            <SearchForm />
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