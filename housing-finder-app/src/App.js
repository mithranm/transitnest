import React from 'react';
import HousingFinderApp from './components/HousingFinderApp';
import { Loader } from '@googlemaps/js-api-loader';

function App() {
  return (
    <div className="App">
      <HousingFinderApp />
    </div>
  );
}

const apiOptions = {
  apiKey: "AIzaSyAwXN7rYnU8FT8yZh4D94qYVFydrh151Vk"
}

const loader = new Loader(apiOptions);
 loader.load().then(() => {
   console.log('Maps JS API loaded');
 });

export default App;