import React from 'react';
import './App.css';
import GraphController from './search/GraphController.js'
import Nav from './components/Nav'
import { Helmet } from 'react-helmet'

function App(props) {
  return (
    <>
      <Helmet>
        <title>6° of WikiData</title>
      </Helmet>
      <div className="App">
        <Nav />
        <GraphController {...props} />
      </div >
    </>
  );
}

export default App;
