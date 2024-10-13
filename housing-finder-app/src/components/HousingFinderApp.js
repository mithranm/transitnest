// src/components/HousingFinderApp.js

import React, { useState, useRef } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import SearchForm from './SearchForm';
import PropertyList from './PropertyList';
import ChatAssistant from './ChatAssistant';
import { Polyline } from './polyline.tsx';
import html2canvas from 'html2canvas';

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
  const [polystring, setPolyString] = useState([]);

  const appRef = useRef(null); // Ref to capture a specific element (optional)

  const handleSearch = (params) => {
    setSearchParams(params);
    // API call to fetch properties
    fetch(`http://localhost:8000/get_properties?${new URLSearchParams(params)}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then((data) => {
        if (data === "") {
          setProperties([]);
        } else {
          const json_data = JSON.parse(data);
          setProperties(json_data);
        }
      })
      .catch((error) => console.log(error));

    setPolyString(polystring);
  };

  const handleChatMessage = (message) => {
    const newUserMessage = { role: "user", content: [{ text: message }] };
    const updatedChatMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedChatMessages);

    // Prepare payload as per backend expectation
    const payload = {
      messages: updatedChatMessages
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
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Received response from /chat:', data);
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
              text: 'Here is a screenshot of the application.'
            },
            {
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
    <div className="flex flex-col h-full" ref={appRef}>
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
              <ChatAssistant messages={chatMessages} onSendMessage={handleChatMessage} />
            </div>
            {/* Screenshot Button */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <button
                onClick={handleSendScreenshot}
                className="
                  bg-indigo-800 text-white 
                  p-2 w-full
                  rounded-md 
                  hover:bg-indigo-700 
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
              defaultZoom={10}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
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
          </APIProvider>
        </div>
      </main>
    </div>
  );
};

export default HousingFinderApp;
