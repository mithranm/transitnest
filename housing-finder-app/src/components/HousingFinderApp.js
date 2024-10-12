import React from 'react';
import { Map, MessageCircle, Send } from 'lucide-react';

const HousingFinderApp = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Housing Finder</h1>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/3 flex flex-col">
          <div className="p-4 overflow-y-auto flex-grow">
            <form className="mb-4 grid grid-cols-2 gap-2">
              <input type="number" placeholder="Budget" className="p-2 border rounded" />
              <input type="number" placeholder="Credit Score" className="p-2 border rounded" />
              <input type="number" placeholder="Max Distance (mi)" className="p-2 border rounded" />
              <select className="p-2 border rounded">
                <option value="">Loan Term</option>
                <option value="15">15 years</option>
                <option value="30">30 years</option>
              </select>
              <input type="text" placeholder="Work Zip" className="p-2 border rounded" />
              <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
                Search
              </button>
            </form>
            
            <div className="space-y-4">
              <div className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold">123 Main St</h3>
                <p>$300,000 | 5.2 mi to work | 0.3 mi to transit</p>
                <p>Est. payment: $1,500/mo</p>
              </div>
            </div>
          </div>
          
          <div className="border-t p-4">
            <div className="bg-gray-100 p-4 rounded-lg mb-4 h-32 overflow-y-auto">
              <p className="font-bold">Assistant:</p>
              <p>The property at 123 Main St is within your budget and close to public transit. The estimated monthly payment is based on a 30-year loan term. Would you like more details about this property?</p>
            </div>
            <div className="flex">
              <input type="text" placeholder="Ask about the results..." className="flex-grow p-2 border rounded-l" />
              <button className="bg-blue-500 text-white p-2 rounded-r">
                <Send size={20} />
              </button>
            </div>
          </div>
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