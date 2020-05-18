import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import App from './App';
import About from './about/About';

export default (
    <BrowserRouter>
        <Switch>
            <Route exact path="/" render={props => <App {...props} />} />
            <Route path="/about" component={About} />
            <Route path="/:first/:obj1/:second/:obj2" render={props => <App {...props} />} />
            <Route component={App} />
        </Switch>
    </BrowserRouter>
);