import React, { Component } from 'react';
import './static/app.css';

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
          <button onClick={ this.findCoordinates }>Press me to find location!</button>
          <h1>Welcome to BusMe</h1>
          <h2>Please input total number of passengers:</h2>
          <input type="text"></input>
          <button type="submit">Submit</button>

        </header>
      </div>
    );
  }
}