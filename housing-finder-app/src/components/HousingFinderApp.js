// src/components/HousingFinderApp.js

import React, { useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import SearchForm from './SearchForm';
import PropertyList from './PropertyList';
import ChatAssistant from './ChatAssistant';
import { Polyline } from './polyline.tsx';
import { Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';



const HousingFinderApp = () => {
  const [searchParams, setSearchParams] = useState({
    budget: '',
    maxDistance: '',
    workZip: ''
  });
  const [properties, setProperties] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [polystring, setPolyString] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isThinking, setThinking] = useState(false);

  const handleSearch = (params) => {
    setLoading(true);
    setSearchParams(params);
    // API call to fetch properties
    fetch(`${process.env["REACT_APP_BACKEND_URL"]}/get_properties?${new URLSearchParams(searchParams)}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then((data) => {
        if (data === "") {
          setLoading(false);
          setProperties([]);
        } else {
          setLoading(false);
          const json_data = JSON.parse(data);
          setProperties(json_data);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });

    setPolyString(polystring);
  };

  const handleChatMessage = (message) => {
    setThinking(true);
    const newUserMessage = { role: "user", content: [{ text: message }] };
    
    // Update chatMessages using functional update to ensure latest state
    setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
  
    // Prepare payload as per backend expectation
    const payload = {
      messages: [...chatMessages, newUserMessage], // Or use prevMessages if needed
    };
  
    console.log('Sending payload to /chat:', JSON.stringify(payload, null, 2));
  
    fetch(`${process.env["REACT_APP_BACKEND_URL"]}/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) {
          setThinking(false);
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setThinking(false);
        console.log('Received response from /chat:', data);
        if (data.message) {
          // Ensure data.message is a valid message object
          if (
            data.message.role &&
            Array.isArray(data.message.content) &&
            typeof data.message.content[0].text === 'string'
          ) {
            const newAssistantMessage = data.message;
            // Use functional update here as well
            setChatMessages((prevMessages) => [...prevMessages, newAssistantMessage]);
          } else {
            console.warn('Unexpected message format:', data.message);
          }
        } else {
          console.warn('No message field in response:', data);
        }
      })
      .catch((error) => {
        setThinking(false);
        console.error('Error communicating with /chat:', error);
      });
  };
  
  const handleSendScreenshot = () => {
    const element = document.body; // Or use appRef.current for a specific element

    html2canvas(element)
      .then((canvas) => {
        const imageData = canvas.toDataURL('image/png');
        const base64Data = imageData.split(',')[1]; // Remove the data URL prefix

        const newMessage = {
          role: 'user',
          content: [
            {
              text: 'Here is a screenshot of the application.',
              image: {
                format: 'png',
                source: {
                  bytes: base64Data
                }
              }
            }
          ]
        };

        const updatedChatMessages = [...chatMessages, newMessage];
        setChatMessages(updatedChatMessages);

        const payload = {
          messages: updatedChatMessages
        };

        fetch(`${process.env["REACT_APP_BACKEND_URL"]}/chat`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();
          })
          .then((data) => {
            if (data.message) {
              const newAssistantMessage = data.message;
              setChatMessages([...updatedChatMessages, newAssistantMessage]);
            } else {
              console.warn('No message field in response:', data);
            }
          })
          .catch((error) => {
            console.error('Error communicating with /chat:', error);
          });
      })
      .catch((error) => {
        console.error('Error capturing screenshot:', error);
      });
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 flex flex-col border-r border-gray-200">
          {/* Search Form */}
          <div className="flex-shrink-0 p-4">
            <SearchForm onSearch={handleSearch} />
          </div>
          {/* Property List and Chat Assistant */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Property List */}
            <div className="flex-1 p-4 overflow-y-auto">
              <PropertyList properties={properties} />
            </div>
            {/* Chat Assistant */}
            <div className="flex-shrink-0 p-4 max-h-[300px] overflow-y-auto border-t border-gray-200">
              <ChatAssistant messages={chatMessages} onSendMessage={handleChatMessage} isThinking={isThinking} />
            </div>
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <button
                onClick={handleSendScreenshot}
                className="
                  bg-gray-800 text-white 
                  p-2 w-full
                  rounded-md 
                  hover:bg-cyan-800 
                  transition-colors duration-200 
                  flex items-center justify-center
                "
              >
                Send Screenshot to Assistant
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="w-2/3 flex flex-col">
          <APIProvider apiKey={process.env.REACT_APP_MAP_API_KEY}>
            <Map
              className="flex-1 w-full"
              defaultCenter={{ lat: 38.897615111606, lng: -77.03526739437355 }}
              defaultZoom={10.5}
              gestureHandling={'none'}
              disableDefaultUI={true}
            >
              {properties.map((property, index) => (
                <Marker key={index} position={{ lat: property.LAT, lng: property.LNG }} />
              ))}
              {properties.slice(0).reverse().map((property, index) => (
                <Polyline
                  key={index}
                  strokeWeight={5}
                  strokeColor={property.color}
                  encodedPath={property.polyline}
                />
              ))}
            </Map>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}
          </APIProvider>
        </div>
      </main>
    </div>
  );
};

export default HousingFinderApp;
