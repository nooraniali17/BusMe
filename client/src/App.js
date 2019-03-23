import React, { Component } from 'react';
import { Router, Route, hasHistory } from 'react-router';
import './static/app.css';
import './BusStops';
import BusStops from './BusStops';
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

  handleInputPassengers = (event) => {
    const userInput = document.getElementById('inputPane').value;

    if(isNaN(userInput) || userInput >= 11 || userInput === '') {
      alert("Please enter a valid integer between 1 and 10!");
    }
    else {
      window.location = 'menu';
    }
  }

  render() {
    console.log(this.state);
    return (
      <div className="App">
        <header className="app-header">
          <button onClick={ this.findCoordinates }>Press me to find location!</button>
          <h1>Welcome to BusMe</h1>
          <h2>Please input total number of passengers:</h2>
          <input id="inputPane"type="text"></input>
          <button id="inputBtn"type="submit"onClick={ this.handleInputPassengers }>Submit</button>

          <BusStops/>

        </header>
      </div>
    );
  }
}