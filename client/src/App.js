import React, { Component } from 'react';
import './static/app.css';
import './BusStops';
import Routing from './Routing';

export default class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      location: null
    };
  }

  findCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({  location: position.coords });
      }
      // {
      //   maximumAge:0,
      //   enableHighAccuracy: true,
      //   timeout: 5000
      // }
    );
  };

  render() {
    console.log(this.state);
    return (
      <div className="App">
        <header className="app-header">
          <Routing />

        </header>
      </div>
    );
  }
}