// ChatAssistant.js

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
    <div className="border-t p-4">
      <div className="bg-gray-100 p-4 rounded-lg mb-4 h-32 overflow-y-auto">
        {messages.map((message, index) => {
          // Ensure that content and text exist and are strings
          if (
            message.content &&
            Array.isArray(message.content) &&
            message.content.length > 0 &&
            typeof message.content[0].text === 'string'
          ) {
            return (
              <p key={index} className={message.role === 'assistant' ? 'font-bold' : ''}>
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
      <form onSubmit={handleSubmit} className="flex">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the results..." 
          className="flex-grow p-2 border rounded-l" 
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
