import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatAssistant = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');

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
        {messages.map((message, index) => (
          <p key={index} className={message.role === 'assistant' ? 'font-bold' : ''}>
            {message.role === 'assistant' ? 'Assistant: ' : 'You: '}
            {message.content[0].text}
          </p>
        ))}
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