import React, { useState } from 'react';
import { APIProvider, Map, Marker, Pin, GoogleMapsContext, useMapsLibrary } from '@vis.gl/react-google-maps';
import SearchForm from './SearchForm';
import PropertyList from './PropertyList';
import ChatAssistant from './ChatAssistant';
import { Polyline } from './polyline.tsx';

const google = window.google;

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

  const handleSearch = (params) => {
    setSearchParams(params);
    // Here you would typically make an API call to fetch properties
    // For now, we'll just set a dummy property
    fetch(`http://localhost:8000/get_properties?${new URLSearchParams(params)}`, {
      method: "GET", headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(response => response.json()).then((data) => {
      if (data === "") {
        setProperties([]);
      } else {
        var json_data = JSON.parse(data);
        setProperties(json_data);
      }
    }).catch((error) => console.log(error));

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

    fetch("http://localhost:8000/chat", {
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
        // Ensure data.message is a valid message object
        if (
          data.message.role &&
          Array.isArray(data.message.content) &&
          typeof data.message.content[0].text === 'string'
        ) {
          const newAssistantMessage = data.message;
          setChatMessages([...updatedChatMessages, newAssistantMessage]);
        } else {
          console.warn('Unexpected message format:', data.message);
        }
      } else {
        console.warn('No message field in response:', data);
      }
    })
    .catch((error) => {
      console.error('Error communicating with /chat:', error);
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/3 flex flex-col h-full">
          <div className="flex-grow overflow-y-auto p-4">
            <SearchForm onSearch={handleSearch} />
            <PropertyList properties={properties} />
          </div>
          <div className="h-1/3 min-h-[200px] overflow-y-auto">
            <ChatAssistant messages={chatMessages} onSendMessage={handleChatMessage} />
          </div>
        </div>

        <div className="w-2/3 h-full">
          <APIProvider apiKey={process.env.REACT_APP_MAP_API_KEY}>
            <Map
              style={{ width: '100%', height: '100%' }}
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