import React from 'react';
import './App.css';
import GraphController from './search/GraphController.js'
import Nav from './components/Nav'


function App() {
  return (
    <div className="App">
      <Nav />
      <GraphController />
    </div >
  );
}

export default App;
