import React from 'react';
import logo from './logo.svg';
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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <Search updateTarget={setTarget} />
      <NetworkGraph target={searchTarget} />
    </div>
  );
}

export default App;
