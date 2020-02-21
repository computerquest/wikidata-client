import React from 'react';
import logo from './logo.svg';
import './App.css';
import Search from './search/Search.js'
import Graph from './graph/Graph.js'

function App() {
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
      <Search />
      <Graph />
    </div>
  );
}

export default App;
