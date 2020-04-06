import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import App from './App';
import About from './about/About';

export default (
    <BrowserRouter>
        <Switch>
            <Route exact path="/">
                <App />
            </Route>
            <Route path="/about">
                <About />
            </Route>
            <Route>
                <App />
            </Route>
        </Switch>
    </BrowserRouter>
);