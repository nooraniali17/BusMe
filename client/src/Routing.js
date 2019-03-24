import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import HomePage from './HomePage/Homepage';


export default class Routing extends Component {
  render() {
    return(    
      <Router>
          <div>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
    
    
            <Route exact path="/" component={Welcome} />
            <Route path="/about" component={Stops} />
          </div>
        </Router>);
  }
}

const Welcome = () => {
  return(
      <div>
          <HomePage/>
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