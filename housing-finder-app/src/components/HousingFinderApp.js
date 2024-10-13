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

    setPolyString('ilrlF`ultMn@HZJPN^d@~@z@X\\d@x@JjA@t@?ZYAAP\\@L??D?OdAAnCEfAApBCxGIpB?fAJZFn@Rh@VZTTV^j@d@h@RRd@Xh@T|@Nl@@lAElAGp@?b@DlAXbCv@|@`@d@\\`@b@h@n@^j@LQHC^Gb@CJ?l@QbCoAn@[NKl@k@r@?RB`@b@h@rB{C|AMJEHARFVHHJ?j@STKBJCKUJFP_A`@F`@aAXCMID_Is]oBwHsAgE{AcEcB}DiBwDgBcD_CuDyMwRqA_BsAyAqUiTqKmKsCkDsCeEiF}In@w@o@v@[e@cOkVk]}k@{BkDeCeDaLaNyHaKkKcMIJuB^[kBFMk@o@wA_BsEgFyBwBwBgBeAu@qHyEqGaE_HaEeEkCwE}C{C{BqAeAoBgBgAiA}DoEkHqIaGgH}G_IgEiFu@eAqB{CwAgCcBiDmD_IwEuKyCiH}JyUc[ut@qt@eeBk[eu@eKgVaIeRwBeFwDmIiJ_SkRka@_Wmi@iFaLyA_Du@eBmCeGgCqFaGkMmHmOoA}BmB{Cw@mAyF{HaHoJsCaEgDoEmDmEeAmAsFgGiCeCcEoDeF_EaD{BgFgDyEaDkK_H{CqBsLcIuE{C{HkFyCwByAgAwAsAeB_BeB_BsCuCgO{O}HmIeC{CyDyEiIkKgEeFs@_AuAsAoAmA_CgB}BuA}BkA}@]{Bu@{Bi@kAWeNuBwIuAwCs@mDeA}CoA{DoByEqCcHkEuFkDoEqCmX{Pw@c@kBoAwDkC{BiB{CuCo@q@kCsCqCmDg@w@eA{AgF}HsCoEq@aA}BkDcEkGyXcb@iDcFwBqCkBwBsCqCmC{BkCkBeDqBiB_AaLiFiD_BKk@Lm@hBgIfAaHv@kCx@gBj@_ALOyBwBAAf@_CH_@kFeBi@Q]@_@BUFi@XwBjEQQOMCF{@e@WM');

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
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Housing Finder</h1>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/3 flex flex-col">
          <div className="p-4 overflow-y-auto flex-grow">
            <SearchForm onSearch={handleSearch} />
            <PropertyList properties={properties} />
          </div>
          <ChatAssistant messages={chatMessages} onSendMessage={handleChatMessage} />
        </div>

        <div className="w-2/3 bg-gray-200 flex items-center justify-center">
          <APIProvider apiKey={process.env.REACT_APP_MAP_API_KEY}>
            <Map
              defaultCenter={{ lat: 38.897615111606, lng: -77.03526739437355 }}
              defaultZoom={10}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
            >
              {properties.map(property => (
                <Marker position={{ lat: property.LAT, lng: property.LNG }} />
              ))}
              {properties.slice(0).reverse().map(property => (
                <Polyline
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