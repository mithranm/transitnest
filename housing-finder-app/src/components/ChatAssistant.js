import React, { useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatAssistant = ({ messages, onSendMessage, isThinking }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="flex flex-col h-full">
      {/* Messages Display */}
      <div className="flex-1 bg-gray-100 p-4 rounded-lg mb-4 overflow-y-auto">
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
                <p className={`font-bold mb-2 ${
                  message.role === 'assistant' ? 'text-gray-800' : 'text-blue-800'
                }`}>
                  {message.role === 'assistant' ? 'Assistant' : 'You'}
                </p>
                <ReactMarkdown 
                  className="prose max-w-none"
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-base font-bold mt-2 mb-1" {...props} />,
                    h5: ({node, ...props}) => <h5 className="text-sm font-bold mt-1 mb-1" {...props} />,
                    h6: ({node, ...props}) => <h6 className="text-xs font-bold mt-1 mb-1" {...props} />,
                    code({node, inline, className, children, ...props}) {
                      return (
                        <code className={`${inline ? 'bg-gray-200 rounded px-1' : 'block bg-gray-800 text-white p-2 rounded'} ${className}`} {...props}>
                          {children}
                        </code>
                      )
                    }
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
        {isThinking && (
          <p className="text-gray-500 italic">Thinking...</p>
        )}
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
};

export default ChatAssistant;