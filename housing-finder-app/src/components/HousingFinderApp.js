import React, { useState } from 'react';
import { APIProvider, InfoWindow, Map, Marker } from '@vis.gl/react-google-maps';
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
  const [polystring, setPolyString] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isThinking, setThinking] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const defaultCenter = { lat: 38.897615111606, lng: -77.03526739437355 };
  const defaultZoom = 10.5;

  const handleSearch = (params) => {
    setLoading(true);
    setSearchParams(params);
  
    // Convert params to query string
    const queryParams = new URLSearchParams(params).toString();
  
    // Use the queryParams in your fetch call
    fetch(`${process.env["REACT_APP_BACKEND_URL"]}/get_properties?${queryParams}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(response => response.json())
      .then((data) => {
        setLoading(false);
        if (data === "") {
          setProperties([]);
        } else {
          const json_data = JSON.parse(data);
          setProperties(json_data);
          
          // Format the search results as a user message
          const formattedResults = json_data.map((property, index) => 
            `Property ${index + 1}: ${property.City}, ${property.State} ${property.ZIP} | ${property.travel_dist} | ${property.duration_text} | $${property.RentPrice.toFixed(2)}/mo`
          ).join('\n');
          
          const userMessage = {
            role: "user",
            content: [{ text: `Search Results:\n${formattedResults}` }]
          };
          
          const assistantMessage = {
            role: "assistant",
            content: [{ text: "I'm here to help you interpret these results, ask away!" }]
          };
          
          // Set the chat messages with the formatted results and initial assistant response
          setChatMessages([userMessage, assistantMessage]);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };
  
  const changePoly = (index) => {
    setCurrentProperty(properties[index]);
    setPolyString(properties[index].polyline);
  };

  const handleChatMessage = (message) => {
    setThinking(true);
    const newUserMessage = { role: "user", content: [{ text: message }] };

    setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);

    const payload = {
      messages: [...chatMessages, newUserMessage],
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
          if (
            data.message.role &&
            Array.isArray(data.message.content) &&
            typeof data.message.content[0].text === 'string'
          ) {
            const newAssistantMessage = data.message;
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
    const element = document.body;

    html2canvas(element)
      .then((canvas) => {
        const imageData = canvas.toDataURL('image/png');
        const base64Data = imageData.split(',')[1];

        const newMessage = {
          role: 'user',
          content: [
            {
              text: 'Help me understand this screenshot of a Rental Locator Application called TransitNest.',
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
              <PropertyList properties={properties} onClick={changePoly} />
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
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              gestureHandling={'auto'}
              disableDefaultUI={true}
            >
              {currentProperty && (
                <>
                  <Marker position={{ lat: currentProperty.LAT, lng: currentProperty.LNG }} />
                  <InfoWindow position={{ lat: currentProperty.LAT, lng: currentProperty.LNG }}>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {currentProperty.City}, {currentProperty.State} {currentProperty.ZIP}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {currentProperty.travel_dist} | {currentProperty.duration_text} | ${currentProperty.RentPrice.toFixed(2)}/mo
                      </p>
                    </div>
                  </InfoWindow>
                </>
              )}

              {polystring && (
                <Polyline
                  strokeWeight={5}
                  strokeColor={'#ff0000'}
                  encodedPath={polystring}
                />
              )}
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