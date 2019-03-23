import React, { Component } from 'react';

export default class HomePage extends Component {

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
        return(
            <div>
            <button onClick={ this.findCoordinates }>Press me to find location!</button>
              <h1>Welcome to BusMe</h1>
              <h2>Please input total number of passengers:</h2>
              <input id="inputPane"type="text"></input>
              <button id="inputBtn"type="submit"onClick={ this.handleInputPassengers }>Submit</button>
        </div>
        );
      }

};
