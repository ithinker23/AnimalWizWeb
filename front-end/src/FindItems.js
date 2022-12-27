import './style.css'

import ItemGrid from './ItemGrid'

function App({sellers,prevDB,matchesDB}) {

  return (
      <ItemGrid sellers={sellers} prevDB={prevDB} matchesDB={matchesDB}/>
  );
}

export default App;
