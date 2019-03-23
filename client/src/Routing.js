import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
// import BusStops from './BusStops';
// import App from './App';
// import HomePage from './HomePage/Homepage';

const Routing = () => {
    return(    
    <Router>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
  
          <hr />
  
          <Route exact path="/" component={Welcome} />
          <Route path="/about" component={Stops} />
        </div>
      </Router>);
}

const Welcome = () => {
    return(
        <div>
            <h1>Hello world </h1>      
        </div>
    );
}

const Stops = () => {
    return(
        <div>
            <h1>Nearby stops!</h1>
        </div>
    );
}

export default Routing;