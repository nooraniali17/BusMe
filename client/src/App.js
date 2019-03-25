import React, { Component } from 'react';
import './static/app.css';
import './BusStops';
import Routing from './Routing';
import MapContainer from './GoogleMapsAPI';

export default class App extends Component {

  state = {
    location: null
  }
  
  // findCoordinates = () => {
  //   navigator.geolocation.getCurrentPosition(
  //     position => {
  //       this.setState({  location: position.coords });
  //     }
  //     // {
  //     //   maximumAge:0,
  //     //   enableHighAccuracy: true,
  //     //   timeout: 5000
  //     // }
  //   );
  // };

  render() {
    console.log(this.state);
    
    return (
      <div className="App">
        <header className="app-header">
        </header>
      <Routing/>
      </div>

    );
  }
}