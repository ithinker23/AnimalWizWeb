import './style.css'

import ItemGrid from './ItemGrid'

function App({sellers,storeDB, socket}) {

  return (
      <ItemGrid sellers={sellers} storeDB={storeDB} socket={socket}/>
  );
}

export default App;
