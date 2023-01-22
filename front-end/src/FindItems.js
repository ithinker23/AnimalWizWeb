import './style.css'

import ItemGrid from './ItemGrid'

function App({sellers,prevDB,matchesDB, socket}) {

  return (
      <ItemGrid sellers={sellers} prevDB={prevDB} matchesDB={matchesDB} socket={socket}/>
  );
}

export default App;
