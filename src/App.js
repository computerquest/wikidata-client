import React from 'react';
import './App.css';
import Search from './search/Search.js'
import NetworkGraph from './graph/NetworkGraph.js'

function App() {
  const [searchTarget, setSearchTarget] = React.useState([])
  let setTarget = (first, second) => {
    console.log('setting target', [first, second])
    setSearchTarget([first, second])
  }

  return (
    <div className="App">
      <Search updateTarget={setTarget} />
      <NetworkGraph target={searchTarget} />
    </div>
  );
}

export default App;
