import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatAssistant = ({ messages, onSendMessage, isThinking }) => {
  const [input, setInput] = React.useState('');
  const [isUndocked, setIsUndocked] = React.useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const ChatContent = (
    <div
      className={`flex flex-col ${
        isUndocked ? 'fixed inset-0 z-50' : ''
      } bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg`}
      style={isUndocked ? { maxWidth: '90%', maxHeight: '90%', margin: 'auto' } : {}}
    >
      {/* Header with Undock/Redock Button */}
      <div className="flex items-center justify-between bg-gray-200 p-2">
        <h2 className="text-lg font-bold">Chat Assistant</h2>
        <button
          onClick={() => setIsUndocked(!isUndocked)}
          className="p-1 bg-gray-300 rounded-full hover:bg-gray-400"
        >
          {isUndocked ? '⤺' : '⤴︎'}
        </button>
      </div>

      {/* Messages Display */}
      <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
        {messages.map((message, index) => {
          if (
            message.content &&
            Array.isArray(message.content) &&
            message.content.length > 0 &&
            typeof message.content[0].text === 'string'
          ) {
            return (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'assistant' ? 'bg-white' : 'bg-blue-100'
                } p-3 rounded-lg`}
              >
                <p
                  className={`font-bold mb-2 ${
                    message.role === 'assistant' ? 'text-gray-800' : 'text-blue-800'
                  }`}
                >
                  {message.role === 'assistant' ? 'Assistant' : 'You'}
                </p>
                <ReactMarkdown
                  className="prose max-w-none"
                  components={{
                    // ... your custom components ...
                  }}
                >
                  {message.content[0].text}
                </ReactMarkdown>
              </div>
            );
          } else {
            console.warn(`Unexpected message structure at index ${index}:`, message);
            return null;
          }
        })}
        {isThinking && <p className="text-gray-500 italic">Thinking...</p>}
        <div ref={messagesEndRef} />
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
            bg-gray-800 text-white 
            p-2 
            rounded-r-md 
            hover:bg-cyan-800 
            transition-colors duration-200 
            flex items-center justify-center
          "
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );

  if (isUndocked) {
    // Create a backdrop
    return ReactDOM.createPortal(
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsUndocked(false)}></div>
        {ReactDOM.createPortal(ChatContent, document.body)}
      </>,
      document.body
    );
  } else {
    // Render normally within parent
    return ChatContent;
  }
};

export default ChatAssistant;