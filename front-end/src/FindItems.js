import './style.css'

import ItemGrid from './ItemGrid'

function App({expressAPI, sellers,storeDB, socket}) {

  return (
      <ItemGrid expressAPI={expressAPI} sellers={sellers} storeDB={storeDB} socket={socket}/>
  );
}

export default App;
