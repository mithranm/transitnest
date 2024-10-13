// src/components/ChatAssistant.js

import React from 'react';
import { Send } from 'lucide-react';

const ChatAssistant = ({ messages, onSendMessage }) => {
  const [input, setInput] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Display */}
      <div className="flex-1 bg-gray-100 p-4 rounded-lg mb-4 overflow-y-auto">
        {messages.map((message, index) => {
          // Ensure that content and text exist and are strings
          if (
            message.content &&
            Array.isArray(message.content) &&
            message.content.length > 0 &&
            typeof message.content[0].text === 'string'
          ) {
            return (
              <p
                key={index}
                className={`mb-2 ${
                  message.role === 'assistant' ? 'font-bold text-blue-600' : 'text-gray-800'
                }`}
              >
                {message.role === 'assistant' ? 'Assistant: ' : 'You: '}
                {message.content[0].text}
              </p>
            );
          } else {
            // Log a warning if the message structure is unexpected
            console.warn(`Unexpected message structure at index ${index}:`, message);
            return null; // Or render a fallback UI element
          }
        })}
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the results..." 
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
        <button
          type="submit"
          className="
            bg-indigo-800 text-white 
            p-2 
            rounded-r-md 
            hover:bg-indigo-700 
            transition-colors duration-200 
            flex items-center justify-center
          "
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
