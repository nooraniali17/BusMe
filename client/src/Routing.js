import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
<<<<<<< .merge_file_rrgIcE
<<<<<<< .merge_file_X0FUeN
import BusStops from './BusStops';
import App from './App';
=======
import HomePage from './Homepage';
import MapContainer from './GoogleMapsAPI';
import Places from './Places';
>>>>>>> .merge_file_3XhFFn
=======
import HomePage from './Homepage';
import MapContainer from './GoogleMapsAPI';
import Places from './Places';
>>>>>>> .merge_file_XBJY51


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
    
      <div style={{ height: '0px' }}>
          <MapContainer />
      </div>
  );
}